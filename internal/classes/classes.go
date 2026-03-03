package classes

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/GoMudEngine/GoMud/internal/configs"
	"github.com/GoMudEngine/GoMud/internal/fileloader"
	"github.com/GoMudEngine/GoMud/internal/mudlog"
	"github.com/GoMudEngine/GoMud/internal/stats"
	"github.com/GoMudEngine/GoMud/internal/util"
)

var (
	allClasses map[int]*Class = map[int]*Class{}
)

type Class struct {
	ClassId        int
	Name           string
	Description    string
	Selectable     bool
	StatBonuses    stats.Statistics `yaml:"statbonuses,omitempty"`
	StartingSkills map[string]int   `yaml:"startingskills,omitempty"`
	StartingSpells map[string]int   `yaml:"startingspells,omitempty"`
	StartingItems  []int            `yaml:"startingitems,omitempty"`
}

func GetClasses() []Class {
	ret := []Class{}
	for _, c := range allClasses {
		ret = append(ret, *c)
	}
	return ret
}

func GetClass(classId int) *Class {
	return allClasses[classId]
}

func FindClass(name string) (Class, bool) {
	name = strings.ToLower(name)
	closeMatch := -1
	for idx, c := range allClasses {
		testName := strings.ToLower(c.Name)
		if strings.HasPrefix(testName, name) {
			return *c, true
		} else if strings.Contains(testName, name) {
			closeMatch = idx
		}
	}
	if closeMatch > -1 {
		return *allClasses[closeMatch], true
	}
	return Class{}, false
}

func (c *Class) Id() int {
	return c.ClassId
}

func (c *Class) Validate() error {
	if c.Name == "" {
		return errors.New("class has no name")
	}
	if c.Description == "" {
		return errors.New("class has no description")
	}
	if c.StartingSkills == nil {
		c.StartingSkills = make(map[string]int)
	}
	if c.StartingSpells == nil {
		c.StartingSpells = make(map[string]int)
	}
	if c.StartingItems == nil {
		c.StartingItems = []int{}
	}
	return nil
}

func (c *Class) Filename() string {
	filename := util.ConvertForFilename(c.Name)
	return fmt.Sprintf("%d-%s.yaml", c.ClassId, filename)
}

func (c *Class) Filepath() string {
	return c.Filename()
}

func LoadDataFiles() {
	start := time.Now()

	tmpClasses, err := fileloader.LoadAllFlatFiles[int, *Class](configs.GetFilePathsConfig().DataFiles.String() + `/classes`)
	if err != nil {
		panic(err)
	}

	allClasses = tmpClasses

	mudlog.Info("classes.LoadDataFiles()", "loadedCount", len(allClasses), "Time Taken", time.Since(start))
}
