package identity

type ParentConditionKeys struct {
	IsEmployed                *bool `json:"is_employed"`
	IsSelfEmployed            *bool `json:"is_self_employed"`
	IsStudent                 *bool `json:"is_student"`
	FiledTaxInDesiredLocation *bool `json:"filed_tax_in_desired_location"`
	ResidesInDesiredLocation  *bool `json:"resides_in_desired_location"`
}
