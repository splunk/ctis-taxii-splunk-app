import {useMediaQuery} from "react-responsive";

export function useViewportBreakpoints() {
    const isSmallScreen = useMediaQuery({minWidth: 0, maxWidth: 1000});
    const isMediumScreen = useMediaQuery({minWidth: 1000, maxWidth: 1300});
    const isLargeScreen = useMediaQuery({minWidth: 1300});
    const isXLargeScreen = useMediaQuery({minWidth: 1900});
    return {isSmallScreen, isMediumScreen, isLargeScreen, isXLargeScreen};
}
