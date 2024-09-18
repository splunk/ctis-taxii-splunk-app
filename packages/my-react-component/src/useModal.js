import {useState} from "react";

export default function useModal(){
    const [open, setOpen] = useState(false);
    const handleRequestClose = () => setOpen(false);
    const handleRequestOpen = () => setOpen(true);
    return {open, handleRequestClose, handleRequestOpen};
}
