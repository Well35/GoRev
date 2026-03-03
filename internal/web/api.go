package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/GoMudEngine/GoMud/internal/characters"
	"github.com/GoMudEngine/GoMud/internal/classes"
	"github.com/GoMudEngine/GoMud/internal/mudlog"
	"github.com/GoMudEngine/GoMud/internal/races"
	"github.com/GoMudEngine/GoMud/internal/users"
)

// CharacterSummary is the DTO returned in character lists.
type CharacterSummary struct {
	Name  string `json:"name"`
	Race  string `json:"race"`
	Class string `json:"class"`
	Level int    `json:"level"`
}

// apiHandler wraps an HTTP handler with panic recovery so a crash produces a
// 500 JSON response rather than a silent TCP close ("socket hang up").
func apiHandler(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				mudlog.Error("API panic", "path", r.URL.Path, "error", fmt.Sprint(rec))
				writeError(w, http.StatusInternalServerError, "internal server error")
			}
		}()
		h(w, r)
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		mudlog.Error("API", "action", "writeJSON", "error", err)
	}
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// bearerToken extracts the token from "Authorization: Bearer <token>".
func bearerToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if strings.HasPrefix(h, "Bearer ") {
		return strings.TrimPrefix(h, "Bearer ")
	}
	return ""
}

// charSummaryFromList builds a CharacterSummary slice from a user's main + alts.
func charSummaryFromUser(user *users.UserRecord) []CharacterSummary {
	out := []CharacterSummary{}

	// Main character — only include if it has a real name (not the temp placeholder)
	if user.Character != nil && user.Character.Name != "" && !strings.HasPrefix(user.Character.Name, "nameless-") {
		raceName := ""
		if r := races.GetRace(user.Character.RaceId); r != nil {
			raceName = r.Name
		}
		className := ""
		if cl := classes.GetClass(user.Character.ClassId); cl != nil {
			className = cl.Name
		}
		out = append(out, CharacterSummary{
			Name:  user.Character.Name,
			Race:  raceName,
			Class: className,
			Level: user.Character.Level,
		})
	}

	// Alt characters
	for _, alt := range characters.LoadAlts(user.UserId) {
		raceName := ""
		if r := races.GetRace(alt.RaceId); r != nil {
			raceName = r.Name
		}
		className := ""
		if cl := classes.GetClass(alt.ClassId); cl != nil {
			className = cl.Name
		}
		out = append(out, CharacterSummary{
			Name:  alt.Name,
			Race:  raceName,
			Class: className,
			Level: alt.Level,
		})
	}

	return out
}

// POST /api/login
func apiLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, err := users.LoadUser(req.Username, true) // skip game-loop validation
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid username or password")
		return
	}

	if !user.PasswordMatches(req.Password) {
		writeError(w, http.StatusUnauthorized, "invalid username or password")
		return
	}

	token := GenerateToken(user.UserId, user.Username)
	writeJSON(w, http.StatusOK, map[string]any{
		"token":      token,
		"characters": charSummaryFromUser(user),
	})
}

// POST /api/register
func apiRegister(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	newUser := users.NewUserRecord(0, 0)

	if err := newUser.SetUsername(req.Username); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := newUser.SetPassword(req.Password); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := users.CreateUserRecord(newUser); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	token := GenerateToken(newUser.UserId, newUser.Username)
	writeJSON(w, http.StatusOK, map[string]string{"token": token})
}

// GET /api/characters
func apiGetCharacters(w http.ResponseWriter, r *http.Request) {
	token := bearerToken(r)
	if token == "" {
		writeError(w, http.StatusUnauthorized, "missing token")
		return
	}

	_, username, ok := ValidateToken(token)
	if !ok {
		writeError(w, http.StatusUnauthorized, "invalid or expired token")
		return
	}

	user, err := users.LoadUser(username, true)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load user")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"characters": charSummaryFromUser(user),
	})
}

// POST /api/characters
func apiCreateCharacter(w http.ResponseWriter, r *http.Request) {
	token := bearerToken(r)
	if token == "" {
		writeError(w, http.StatusUnauthorized, "missing token")
		return
	}

	_, username, ok := ValidateToken(token)
	if !ok {
		writeError(w, http.StatusUnauthorized, "invalid or expired token")
		return
	}

	var req struct {
		Name    string `json:"name"`
		RaceId  int    `json:"race_id"`
		ClassId int    `json:"class_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}

	// Verify race is valid and selectable
	race := races.GetRace(req.RaceId)
	if race == nil || !race.Selectable {
		writeError(w, http.StatusBadRequest, "invalid or non-selectable race")
		return
	}

	// Verify class is valid and selectable
	if req.ClassId == 0 {
		writeError(w, http.StatusBadRequest, "class is required")
		return
	}
	class := classes.GetClass(req.ClassId)
	if class == nil || !class.Selectable {
		writeError(w, http.StatusBadRequest, "invalid or non-selectable class")
		return
	}

	user, err := users.LoadUser(username, true)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load user")
		return
	}

	// Check name uniqueness across all of this user's characters
	if user.Character != nil && strings.EqualFold(user.Character.Name, req.Name) {
		writeError(w, http.StatusBadRequest, "a character with that name already exists")
		return
	}
	for _, alt := range characters.LoadAlts(user.UserId) {
		if strings.EqualFold(alt.Name, req.Name) {
			writeError(w, http.StatusBadRequest, "a character with that name already exists")
			return
		}
	}

	isFirstChar := user.Character == nil ||
		user.Character.Name == "" ||
		strings.HasPrefix(user.Character.Name, "nameless-")

	if isFirstChar {
		// Set name + race on main character slot
		if err := user.SetCharacterName(req.Name); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		user.Character.RaceId = req.RaceId
		if err := user.Character.ApplyClass(req.ClassId); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to apply class")
			return
		}
		if err := users.SaveUser(*user); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to save user")
			return
		}
	} else {
		// Create an alt character
		newChar := characters.New()
		newChar.Name = req.Name
		newChar.RaceId = req.RaceId
		newChar.SetUserId(user.UserId)
		if err := newChar.ApplyClass(req.ClassId); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to apply class")
			return
		}

		alts := characters.LoadAlts(user.UserId)
		alts = append(alts, *newChar)
		if !characters.SaveAlts(user.UserId, alts) {
			writeError(w, http.StatusInternalServerError, "failed to save character")
			return
		}
	}

	// Reload user to get fresh data for response
	user, err = users.LoadUser(username, true)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to reload user")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"characters": charSummaryFromUser(user),
	})
}

// GET /api/game-options
func apiGameOptions(w http.ResponseWriter, r *http.Request) {
	type RaceOption struct {
		Id          int    `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	type ClassOption struct {
		Id          int    `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	allRaces := races.GetRaces()
	raceOptions := []RaceOption{}
	for _, race := range allRaces {
		if race.Selectable {
			raceOptions = append(raceOptions, RaceOption{
				Id:          race.RaceId,
				Name:        race.Name,
				Description: race.Description,
			})
		}
	}

	allClasses := classes.GetClasses()
	classOptions := []ClassOption{}
	for _, cl := range allClasses {
		if cl.Selectable {
			classOptions = append(classOptions, ClassOption{
				Id:          cl.ClassId,
				Name:        cl.Name,
				Description: cl.Description,
			})
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"races":   raceOptions,
		"classes": classOptions,
	})
}
