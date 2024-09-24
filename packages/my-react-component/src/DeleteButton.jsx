import React from "react";
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import SubmitButton from "./SubmitButton";

export default function DeleteButton({
                                         disabled,
                                         submitting,
                                         label = "Delete",
                                         inline = true,
                                         type = "button",
                                         ...props
                                     }) {
    return (
        <SubmitButton inline={inline} type={type} icon={<TrashCanCross/>} label={label} appearance="destructive"
                    disabled={disabled} submitting={submitting} {...props} />
    );
}
