export const monthList = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export const convertDate = (date: string) => {
    const newDate = new Date(date);
    const [month, day, year] = [newDate.getMonth(), newDate.getDate(), newDate.getFullYear(), newDate.getDay()];
    const dateString = `${day} ${monthList[month]} ${year}`
    return dateString;
}

export const dateToString = (date: Date | null) => {
    if (!date) return ""; 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); 
    const day = String(date.getDate()).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  }
  