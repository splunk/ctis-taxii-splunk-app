import React from "react";
import BaseButton from "./BaseButton";
import Pencil from "@splunk/react-icons/Pencil";

export default function EditButton({label = "Edit", ...props}) {
    return (
        <BaseButton icon={<Pencil/>} label={label} appearance="primary" {...props} />
    );
}
