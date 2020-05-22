/**
 * @description return people in an abbreviated format
 * @param {number} people - number of people
 * @returns {string}
 */
function getPeople(people){
    if (isNaN(people)||people <= 0||people>=10**9) {
        throw new Error('Кривые данные');
    }

    if (people < 10 ** 3) {
        return `${people}`;
    } else if (people < 10 ** 6) {
        return `${Math.floor(people / 10**3)}К`;
    } else if (people < 10 ** 9) {
        return `${Math.floor(people / 10**6)}М`;
    }
}
module.exports = getPeople;