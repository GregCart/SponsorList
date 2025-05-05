package sponsorlist.utils

import java.util.Calendar
import java.util.Date


fun Date.subtractDays(days: Int): Date {
    val cal = Calendar.getInstance()
    cal.setTime(this)
    cal.add(Calendar.DATE, -days)
    return cal.getTime()
}
