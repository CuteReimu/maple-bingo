// ==================== 算法核心 ====================

/**
 * 将三位数拆成数字数组，例如 123 => [1, 2, 3]
 */
function toDigits(n) {
  return [Math.floor(n / 100), Math.floor((n / 10) % 10), n % 10]
}

/**
 * 比较猜测与答案，返回 [○数量, △数量]
 * ○ = 数字正确且位置正确
 * △ = 数字正确但位置错误
 */
function compare(guess, answer) {
  const g = toDigits(guess)
  const a = toDigits(answer)
  let circle = 0, triangle = 0
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (g[i] === a[j]) {
        if (i === j) circle++
        else triangle++
      }
    }
  }
  return [circle, triangle]
}

/**
 * 生成所有合法的答案（1-9 中三个不同数字的全排列，共 504 种）
 */
function getAllPossible() {
  const result = []
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      if (b === a) continue
      for (let c = 1; c <= 9; c++) {
        if (c === a || c === b) continue
        result.push(a * 100 + b * 10 + c)
      }
    }
  }
  return result
}

/**
 * 根据反馈过滤剩余可能答案
 */
function filterPossible(possible, guess, circle, triangle) {
  return possible.filter(answer => {
    const [c, t] = compare(guess, answer)
    return c === circle && t === triangle
  })
}

/**
 * 计算对某个猜测的信息熵。
 * 若某个反馈结果为 3○（猜中），则给予额外奖励（经验值 +10），
 * 以优先选择有机会直接猜中的答案。
 */
function calcEntropy(guess, possible) {
  const total = possible.length
  if (total === 0) return 0
  const counts = {}
  for (const answer of possible) {
    const [c, t] = compare(guess, answer)
    const key = `${c},${t}`
    counts[key] = (counts[key] || 0) + 1
  }
  let H = 0
  for (const key in counts) {
    const p = counts[key] / total
    // 若是 3○（猜中），额外奖励信息量以鼓励直接猜中
    const bonus = key === '3,0' ? 10 : 0
    H += p * Math.log2(1 / p + bonus)
  }
  return H
}

/**
 * 从所有合法猜测中，选出信息熵最大的那个。
 * 优先选取仍在候选列表中的猜测（相同熵时更优）。
 */
function chooseBestGuess(possible) {
  if (possible.length === 1) return possible[0]

  const allGuesses = getAllPossible()
  let bestGuess = allGuesses[0]
  let bestEntropy = -Infinity
  let bestInPossible = false

  for (const guess of allGuesses) {
    const H = calcEntropy(guess, possible)
    const inPossible = possible.includes(guess)
    const better =
      H > bestEntropy + 1e-9 ||
      (Math.abs(H - bestEntropy) < 1e-9 && inPossible && !bestInPossible)
    if (better) {
      bestEntropy = H
      bestGuess = guess
      bestInPossible = inPossible
    }
  }
  return { guess: bestGuess, entropy: bestEntropy }
}

// ==================== Vue 应用 ====================

const { createApp, ref, computed } = Vue

const app = createApp({
  setup() {
    const allPossible = getAllPossible() // 504 种可能

    const possible = ref([...allPossible])
    const round = ref(0)
    const history = ref([])
    const inputCircle = ref(0)
    const inputTriangle = ref(0)
    const solved = ref(false)
    const noSolution = ref(false)

    // 初始最优猜测
    const initialResult = chooseBestGuess([...allPossible])
    const currentGuess = ref(initialResult.guess)
    const rawEntropy = ref(initialResult.entropy)

    const possibleCount = computed(() => possible.value.length)
    const currentEntropy = computed(() => rawEntropy.value.toFixed(3))

    function digits(n) {
      return toDigits(n)
    }

    function formatGuess(n) {
      const d = toDigits(n)
      return `${d[0]}-${d[1]}-${d[2]}`
    }

    function confirm() {
      const c = inputCircle.value
      const t = inputTriangle.value

      // 记录历史
      history.value.push({
        round: round.value + 1,
        guess: currentGuess.value,
        circle: c,
        triangle: t,
        remaining: possible.value.length,
      })

      round.value++

      if (c === 3) {
        // 猜中了
        solved.value = true
        return
      }

      // 过滤候选
      const newPossible = filterPossible(possible.value, currentGuess.value, c, t)
      possible.value = newPossible

      if (newPossible.length === 0) {
        noSolution.value = true
        return
      }

      if (newPossible.length === 1) {
        // 只剩一个，直接给出答案
        currentGuess.value = newPossible[0]
        rawEntropy.value = 0
        return
      }

      // 重新计算最优猜测
      const result = chooseBestGuess(newPossible)
      currentGuess.value = result.guess
      rawEntropy.value = result.entropy

      // 重置输入
      inputCircle.value = 0
      inputTriangle.value = 0
    }

    function reset() {
      possible.value = [...allPossible]
      round.value = 0
      history.value = []
      inputCircle.value = 0
      inputTriangle.value = 0
      solved.value = false
      noSolution.value = false
      const result = chooseBestGuess([...allPossible])
      currentGuess.value = result.guess
      rawEntropy.value = result.entropy
    }

    return {
      possible,
      possibleCount,
      round,
      history,
      inputCircle,
      inputTriangle,
      solved,
      noSolution,
      currentGuess,
      currentEntropy,
      digits,
      formatGuess,
      confirm,
      reset,
    }
  }
})

app.use(ElementPlus)
app.mount('#app')
