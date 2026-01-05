import dayjs from "dayjs";
import jalaliday from "jalaliday"

dayjs.extend(jalaliday)


const EnglishToPersian = (date)=>{
    const persinaDate = dayjs(date)
        .calendar("jalali")
        .locale("fa")
        .format("YYYY/MM/DD HH:MM")
    return persinaDate
}

export default EnglishToPersian;