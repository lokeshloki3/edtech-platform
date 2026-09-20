export default function GetAvgRating(ratingArr) {
    // if (ratingArr?.length === 0) return 0
    // Check if ratingArr is a valid array and has elements
    if (!Array.isArray(ratingArr) || ratingArr.length === 0) return 0;
    const totalReviewCount = ratingArr?.reduce((acc, curr) => {
        // acc += curr.rating
        acc += curr.rating || 0;  // Ensure that curr.rating is a number
        return acc
    }, 0)

    const multiplier = Math.pow(10, 1)
    const avgReviewCount =
        Math.round((totalReviewCount / ratingArr?.length) * multiplier) / multiplier

    return avgReviewCount
}
