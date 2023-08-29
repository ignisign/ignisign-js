import moment from "moment";

export function formattedDate(date: Date, displayHours: boolean = false) {
  return  displayHours ?
    moment(new Date(date)).format("DD/MM/YY - HH:mm (Z)") :
    moment(new Date(date)).format("DD/MM/YY")
}


export function formattedTimeFromDate(date: Date) {
  return moment(new Date(date)).format("HH:mm:ss") 
}

export function formatDateToFromNow(date: Date){
  return moment(date).fromNow()
}