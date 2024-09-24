import React from "react";
import {StyledButton} from "./StyledButton";

export default function BaseButton({
                                       children,
                                       disabled,
                                       label,
                                       inline = false,
                                       type = "button",
                                       appearance = "primary",
                                       ...props
                                   }) {
    return (
        <StyledButton inline={inline} type={type} label={label} appearance={appearance} disabled={disabled} {...props}>
            {children}
        </StyledButton>
    );
}
