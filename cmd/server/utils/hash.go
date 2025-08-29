package utils

import "golang.org/x/crypto/bcrypt"

func ComparePasswords(plainPw string, hashedPw string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPw), []byte(plainPw)); err != nil {
		return err
	}
	return nil
}
