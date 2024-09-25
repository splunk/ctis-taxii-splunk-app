import React from "react";
import BaseButton from "./BaseButton";

export default function CancelButton({submitting, onClick, inline = true, label = "Cancel", type = "button", ...props}) {
    const goBackInHistory = () => history.back();
    return (
        <BaseButton inline={inline} type={type} appearance={"secondary"} label={label} onClick={onClick || goBackInHistory} {...props}/>
    );
}
