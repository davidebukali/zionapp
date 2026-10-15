import React from "react";
import { PrimaryButton, PrimaryButtonProps } from "../PrimaryButton";

export type AuthButtonProps = PrimaryButtonProps;

export function AuthButton(props: AuthButtonProps) {
  return <PrimaryButton {...props} />;
}

export default AuthButton;
