package usercommands

import (
	"errors"
	"fmt"
	"time"

	"github.com/GoMudEngine/GoMud/internal/configs"
	"github.com/GoMudEngine/GoMud/internal/events"
	"github.com/GoMudEngine/GoMud/internal/rooms"
	"github.com/GoMudEngine/GoMud/internal/scripting"
	"github.com/GoMudEngine/GoMud/internal/term"
	"github.com/GoMudEngine/GoMud/internal/users"
)

func Start(rest string, user *users.UserRecord, room *rooms.Room, flags events.EventFlag) (bool, error) {
	if user.Character.RoomId != -1 {
		return false, errors.New(`only allowed in the void`)
	}

	// Only fire CharacterCreated once (first time through)
	if user.Character.Created.IsZero() {
		user.Character.ExtraLives = int(configs.GetGamePlayConfig().LivesStart)
		user.Character.Created = time.Now()
		user.EventLog.Add(`char`, fmt.Sprintf(`Created a new character: <ansi fg="username">%s</ansi>`, user.Character.Name))
		events.AddToQueue(events.CharacterCreated{UserId: user.UserId, CharacterName: user.Character.Name})
	}

	user.SendText(fmt.Sprintf(`<ansi fg="magenta">Suddenly, a vortex appears before you, drawing you in before you have any chance to react!</ansi>%s`, term.CRLFStr))

	if destRoom := rooms.LoadRoom(rooms.StartRoomIdAlias); destRoom != nil {

		rooms.MoveToRoom(user.UserId, destRoom.RoomId)

		destRoom.SendText(
			fmt.Sprintf(configs.GetTextFormatsConfig().EnterRoomMessageWrapper.String(),
				fmt.Sprintf(`<ansi fg="username">%s</ansi> enters from <ansi fg="exit">somewhere</ansi>.`, user.Character.Name),
			),
			user.UserId,
		)

		if doLook, err := scripting.TryRoomScriptEvent(`onEnter`, user.UserId, destRoom.RoomId); err != nil || doLook {
			Look(``, user, destRoom, events.CmdSecretly)
		}

		room.PlaySound(`room-exit`, `movement`, user.UserId)
		destRoom.PlaySound(`room-enter`, `movement`, user.UserId)
	}

	return true, nil
}
