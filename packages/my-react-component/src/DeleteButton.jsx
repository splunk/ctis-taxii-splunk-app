import React from "react";
import SubmitButton from "./SubmitButton";
import TrashCanCross from '@splunk/react-icons/TrashCanCross';

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
