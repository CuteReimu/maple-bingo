let available = []
let guess = 123

function calAB(guess, answer) {
  const v0 = [Math.floor(guess / 100), Math.floor(guess / 10 % 10), Math.floor(guess % 10)]
  const v1 = [Math.floor(answer / 100), Math.floor(answer / 10 % 10), Math.floor(answer % 10)]
  let a = 0
  let b = 0
  for (const i in v0) {
    for (const j in v1) {
      if (v0[i] === v1[j]) {
        if (i === j) a++
        else b++
        break
      }
    }
  }
  return [a, b]
}

function chooseGuess(available) {
  let minGuess = 0
  let minGuessCount = Infinity
  for (let i of available) {
    const ave = calAverageAvailable(available, i)
    if (ave < minGuessCount) {
      minGuessCount = ave
      minGuess = i
    }
  }
  for (let i = 123; i <= 987; i++) {
    const v = [Math.floor(i / 100), Math.floor(i / 10 % 10), Math.floor(i % 10)]
    if (v[0] !== v[1] && v[0] !== v[2] && v[1] !== v[2] && v[0] !== 0 && v[1] !== 0 && v[2] !== 0) {
      const ave = calAverageAvailable(available, i)
      if (ave < minGuessCount) {
        minGuessCount = ave
        minGuess = i
      }
    }
  }
  return minGuess
}

function calAverageAvailable(available, guess) {
  let count = 0
  for (const answer of available) {
    const ab = calAB(answer, guess)
    count += countNewAvailable(available, guess, ab[0], ab[1])
  }
  return count / available.length
}

function calNewAvailable(available, guess, a, b) {
  return available.filter(num => {
    const ab = calAB(num, guess)
    return ab[0] === a && ab[1] === b
  })
}

function countNewAvailable(available, guess, a, b) {
  return available.reduce((count, num) => {
    const ab = calAB(num, guess)
    if (ab[0] === a && ab[1] === b) {
      count++
    }
    return count
  }, 0)
}

function doStuff() {
  const a = Number(document.getElementById("a").value)
  const b = Number(document.getElementById("b").value)
  if (a < 0 || a > 3 || b < 0 || b > 3) {
    document.getElementById("label").innerHTML = "请输入正确的a和b的值"
    return
  }
  available = calNewAvailable(available, guess, a, b)
  document.getElementById("left").innerHTML = "猜了" + guess + "后剩余可能" + available
  if (available.length === 1) {
    document.getElementById("label").innerHTML = "答案是" + available[0]
  } else if (available.length === 0) {
    document.getElementById("label").innerHTML = "没有答案"
  } else {
    guess = chooseGuess(available)
    document.getElementById("label").innerHTML = "请猜" + guess + "并输入a和b的值"
  }
}

function doReset() {
  document.getElementById("label").innerHTML = "请猜123并输入a和b的值"
  available = []
  guess = 123
  for (let i = 123; i <= 987; i++) {
    const v = [Math.floor(i / 100), Math.floor(i / 10 % 10), Math.floor(i % 10)]
    if (v[0] !== v[1] && v[0] !== v[2] && v[1] !== v[2] && v[0] !== 0 && v[1] !== 0 && v[2] !== 0) {
      available.push(i)
    }
  }
  document.getElementById("left").innerHTML = "剩余可能" + available
}

doReset()
