package user

type Gender string

var (
	Male   Gender = "male"
	Female Gender = "female"
)

func (g Gender) IsValid() bool {
	switch g {
	case Male, Female:
		return true
	}
	return false
}
