import { useState, useMemo } from 'react';

function useLargeArray(initialArray = []) {
    const [array, setArray] = useState(initialArray);

    // Memoize the array to prevent re-computation on every render
    const memoizedArray = useMemo(() => array, [array]);

    // Function to update the array
    const updateArray = (newArray) => setArray(newArray);

    return [memoizedArray, updateArray];
}

export default useLargeArray;
