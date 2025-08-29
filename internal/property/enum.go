package property

type UserRole string

var (
	Admin  UserRole = "admin"
	Parent UserRole = "parent"
)

func (r UserRole) IsValid() bool {
	switch r {
	case Admin, Parent:
		return true
	}
	return false
}
