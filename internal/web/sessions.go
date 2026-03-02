package web

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"
)

const sessionTTL = 24 * time.Hour

type Session struct {
	UserId    int
	Username  string
	ExpiresAt time.Time
}

var sessionStore sync.Map // token(string) → Session

// GenerateToken creates a new session token for the given user and stores it.
func GenerateToken(userId int, username string) string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic("sessions: failed to generate random token: " + err.Error())
	}
	token := hex.EncodeToString(b)
	sessionStore.Store(token, Session{
		UserId:    userId,
		Username:  username,
		ExpiresAt: time.Now().Add(sessionTTL),
	})
	return token
}

// GetSession returns the Session for the given token, checking expiry.
func GetSession(token string) (Session, bool) {
	v, ok := sessionStore.Load(token)
	if !ok {
		return Session{}, false
	}
	sess := v.(Session)
	if time.Now().After(sess.ExpiresAt) {
		sessionStore.Delete(token)
		return Session{}, false
	}
	return sess, true
}

// ValidateToken returns the userId and username for a valid token.
func ValidateToken(token string) (int, string, bool) {
	sess, ok := GetSession(token)
	if !ok {
		return 0, "", false
	}
	return sess.UserId, sess.Username, true
}

// DeleteToken removes a session token.
func DeleteToken(token string) {
	sessionStore.Delete(token)
}
