/**
 * @description return date of the last update
 * @returns {string}
 */
function renderDate(){
    const date=document.getElementById('date');
    const timeNow=new Date();
    date.innerHTML=`<h4>Last Updated at (D/M/YYYY)</h4><h3>${timeNow.getDate()}/${timeNow.getMonth()+1}/${timeNow.getFullYear()}, ${timeNow.toLocaleTimeString()}</h3>`;
}
module.exports = renderDate;
