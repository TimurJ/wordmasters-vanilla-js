const NUMBER_OF_TRIES = 6
const NUMBER_OF_LETTERS = 5
const WORD_OF_THE_DAY_URL = "https://words.dev-apis.com/word-of-the-day"
const WORD_VALIDATOR_URL = "https://words.dev-apis.com/validate-word"
let guessedWord = []
let gameOver = false
let letterIndex = 0
let rowIndex = 0

async function getWordOfTheDay() {
  const result = await fetch(WORD_OF_THE_DAY_URL)
  const json = await result.json()
  return json.word
}

async function validateWord(word) {
  const result = await fetch(WORD_VALIDATOR_URL, {
    method: "POST",
    body: JSON.stringify({
      word: word,
    }),
  })
  const json = await result.json()
  return json.validWord
}

function createHeader() {
  const header = document.createElement("h1")
  header.classList.add("header")
  header.textContent = "Word Masters"
  return header
}

function createWordRow(rowNumber) {
  const wordRow = document.createElement("div")
  wordRow.classList.add("words-row")
  wordRow.classList.add(`row-number-${rowNumber}`)

  for (let i = 0; i < NUMBER_OF_LETTERS; i++) {
    const letterContainer = document.createElement("div")
    letterContainer.classList.add("letter-container")
    wordRow.append(letterContainer)
  }

  return wordRow
}

function createWordsGrid() {
  const grid = document.createElement("div")
  grid.classList.add("words-grid")

  for (let i = 0; i < NUMBER_OF_TRIES; i++) {
    const wordRow = createWordRow(i)
    grid.append(wordRow)
  }

  return grid
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter)
}

function handleLetterColouring(wordOfTheDay, letterContainers) {
  const wordOfDayLetters = wordOfTheDay.toUpperCase().split("")

  guessedWord.forEach((letter, index) => {
    if (letter === wordOfDayLetters[index]) {
      letterContainers[index].classList.add("correct-letter")
      wordOfDayLetters.splice(index, 1, "")
    }
  })

  guessedWord.forEach((letter, index) => {
    const isCorrectLetter = letterContainers[index].classList.contains("correct-letter")
    if (wordOfDayLetters.includes(letter) && !isCorrectLetter) {
      letterContainers[index].classList.add("semi-correct-letter")
      wordOfDayLetters.splice(
        wordOfDayLetters.findIndex((e) => e === letter),
        1,
        ""
      )
    }
  })

  for (const container of letterContainers) {
    if (
      !container.classList.contains("correct-letter") &&
      !container.classList.contains("semi-correct-letter")
    ) {
      container.classList.add("incorrect-letter")
    }
  }
}

function handleKeyPress(wordOfTheDay) {
  return async function (event) {
    if (gameOver) {
      return
    }

    const letters = document.getElementsByClassName(`row-number-${rowIndex}`)[0].children

    if (isLetter(event.key) && letterIndex < NUMBER_OF_LETTERS) {
      letters[letterIndex].textContent = event.key.toUpperCase()
      guessedWord.push(event.key.toUpperCase())
      letterIndex++
    } else if (event.key === "Backspace" && letterIndex > 0) {
      letterIndex--
      letters[letterIndex].textContent = ""
      guessedWord.pop()
    } else if (
      event.key === "Enter" &&
      letterIndex === NUMBER_OF_LETTERS &&
      rowIndex < NUMBER_OF_TRIES
    ) {
      const isValidWord = await validateWord(guessedWord.join("").toLocaleLowerCase())

      if (!isValidWord) {
        alert("Invalid Word!")
        return
      }

      handleLetterColouring(wordOfTheDay, letters)

      if (guessedWord.join("").toLowerCase() === wordOfTheDay.toLowerCase()) {
        gameOver = true
        alert("You Won!")
        return
      }

      if (rowIndex === NUMBER_OF_TRIES) {
        gameOver = true
        alert("You Lost!")
        return
      }

      rowIndex++
      letterIndex = 0
      guessedWord = []
    }
  }
}

async function initialise() {
  const root = document.getElementById("root")
  const wordOfTheDay = await getWordOfTheDay()
  const header = createHeader()
  const wordGrid = createWordsGrid()

  document.addEventListener("keyup", handleKeyPress(wordOfTheDay))
  root.append(header)
  root.append(wordGrid)
}

initialise()
