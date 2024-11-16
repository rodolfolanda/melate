var games = {
    sixFourtyNine: { min: 1, max: 49, count: 6 },
    lottoMax: { min: 1, max: 50, count: 7 }
};
function generateRandomNumbers(config) {
    var min = config.min, max = config.max, count = config.count;
    var numbers = [];
    while (numbers.length < count) {
        var randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numbers.includes(randomNumber)) {
            numbers.push(randomNumber);
        }
    }
    return numbers.sort(function (a, b) { return a - b; });
}
console.log(generateRandomNumbers(games.sixFourtyNine));
console.log(generateRandomNumbers(games.lottoMax));
