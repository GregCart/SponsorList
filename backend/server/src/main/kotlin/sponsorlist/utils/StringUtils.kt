package sponsorlist.utils

import java.util.*


class EditDistence {
    companion object {
        public fun stringSimilarTo(x: String, y: String, maxEdits: Int = 3): Boolean {
            val dp = Array<IntArray?>(x.length + 1) { IntArray(y.length + 1) }

            for (i in 0..x.length) {
                for (j in 0..y.length) {
                    if (i == 0) {
                        dp[i]!![j] = j
                    } else if (j == 0) {
                        dp[i]!![j] = i
                    } else {
                        dp[i]!![j] = min(
                            dp[i - 1]!![j - 1]
                                    + costOfSubstitution(x.get(i - 1), y.get(j - 1)),
                            dp[i - 1]!![j] + 1,
                            dp[i]!![j - 1] + 1
                        )
                    }

                    if (dp[i]!![j] > maxEdits) {
                        return false
                    }
                }
            }

            return true
        }

        public fun calculate(x: String, y: String): Int {
            val dp = Array<IntArray?>(x.length + 1) { IntArray(y.length + 1) }

            for (i in 0..x.length) {
                for (j in 0..y.length) {
                    if (i == 0) {
                        dp[i]!![j] = j
                    } else if (j == 0) {
                        dp[i]!![j] = i
                    } else {
                        dp[i]!![j] = min(
                            dp[i - 1]!![j - 1]
                                    + costOfSubstitution(x.get(i - 1), y.get(j - 1)),
                            dp[i - 1]!![j] + 1,
                            dp[i]!![j - 1] + 1
                        )
                    }
                }
            }

            return dp[x.length]!![y.length]
        }

        fun costOfSubstitution(a: Char, b: Char): Int {
            return if (a == b) 0 else 1
        }

        fun min(vararg numbers: Int): Int {
            return Arrays.stream(numbers)
                .min().orElse(Int.Companion.MAX_VALUE)
        }
    }
}

fun String.like(other: String): Boolean {
    return (EditDistence.stringSimilarTo(this, other));
}

fun String.like(other: String, edits: Int): Boolean {
    return (EditDistence.stringSimilarTo(this, other, edits));
}