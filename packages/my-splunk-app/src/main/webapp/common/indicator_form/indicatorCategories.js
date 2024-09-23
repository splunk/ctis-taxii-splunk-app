import {useEffect, useState} from "react";
import {listIndicatorCategories} from "@splunk/my-react-component/src/ApiClient";

export default function useIndicatorCategories() {
    const [indicatorCategories, setIndicatorCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        listIndicatorCategories(null, null, (resp) => {
            console.log(resp);
            setIndicatorCategories(resp.categories.map((category) => ({label: category, value: category})));
            setLoading(false);
        }, console.error).then();
    }, []);
    return {indicatorCategories, loading}

}
