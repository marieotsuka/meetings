console.log('script loaded');
let peopleList = [];
let peopleCount = 0;
let breakCount = 0;
let breakSize = 1;
let group = false;
let useBreak = false;
document.addEventListener('DOMContentLoaded', function () {

  let groupCountInput = document.getElementById('groupcount');
  let groupCheckbox = document.getElementById('group');
  let individualCheckbox = document.getElementById('individual');
  let breakCountInput = document.getElementById('breakcount');
  let breakDurationInput = document.getElementById('breakduration')

  document.getElementById('list').addEventListener('input', function(e){
    let people = this.value;
    if( people == '' ){
      peopleCount = 0;
    }else{
      peopleList = people.trim().split(/\r?\n|\r|\n/g);
      peopleCount = peopleList.length;
    }
    document.getElementById('peoplecount').innerText = peopleCount;
    groupCountInput.setAttribute('max', peopleCount);
    breakCountInput.setAttribute('max', peopleCount);
  });

  breakCountInput.addEventListener('input', function(e){
    breakCount = parseInt(this.value);
    console.log('bc', breakCount);
    if( breakCount > 0 ){     
      //require break min
      breakDurationInput.setAttribute('required', true);
      breakSize = Math.ceil(peopleCount / (breakCount+1))
      useBreak = true;
    }else{
      breakDurationInput.removeAttribute('required');
      useBreak = false;
    }
  });

  individualCheckbox.addEventListener('input', function(e){  
    if(this.checked){  
      group = false;
    }
  });

  groupCheckbox.addEventListener('input', function(e){    
    if(this.checked){     
      //require group size
      group = true;
      groupCountInput.setAttribute('required', true);
    }else{
      group = false;
      groupCountInput.removeAttribute('required');
    }
  });

  groupCountInput.addEventListener('input', function(e){    
    groupCheckbox.checked = true;
    group = true;
  }); 

  let form = document.getElementById('form');
  form.addEventListener('submit', function(e){
    e.preventDefault();

    document.getElementById('group-result').innerHTML = ''; //clear

    let timeFrom = new Date("01/01/2000 " + document.getElementById('time-from').value);
    let timeTo = new Date("01/01/2000 " + document.getElementById('time-to').value);
    let diff = timeTo - timeFrom;

    //check for breaks    
    let breakmin, breaksec = 0;
    if ( breakCount > 0 ){
      useBreak = true;
      breakmin = parseInt(breakDurationInput.value);
      breaksec = breakmin * 60 * 1000;
      totalbreak = breakCount * breaksec;
      diff = diff - totalbreak;
    }

    // divide available time by number of people
    let duration = diff / peopleCount;
    let duration_min = Math.floor(duration/1000/60);
    duration = duration_min * 60 * 1000 //reset duration to rounded number

    document.getElementById('crit-duration').innerText = duration_min;

    // setup when breaks will happen
    let result = ""
    let time = timeFrom;

    let list = [];
    if ( document.getElementById('randomize').checked ){
      list = shuffle( [...peopleList] ); //shuffle deep copy
    }else{
      list = peopleList;
    } 

    if(group){
      let count = 0;
      let groupIndex = 1;
      let groupCount = parseInt(document.getElementById('groupcount').value);
      let grouped = splitArray(list, groupCount);
      let sync = false;
      if( breakCount == groupCount-1){
        //match up breaks with group divisions
        sync = true;
      }

      grouped.forEach( function(group, j){
        
        if(useBreak && sync && j != 0){
          //sync up breaks with section divisions
          result += `\n\n${formatAMPM(time)}\tBreak for ${breakmin}min\n`;
          time = new Date( time.getTime()+breaksec );
        }

        group.forEach( function(member){             
          if(useBreak && !sync && count%breakSize == 0 && count!=0){
            console.log('BREAK');
            result += `\n\n${formatAMPM(time)}\tBreak for ${breakmin}min\n`;
            time = new Date( time.getTime()+breaksec );           
          }       
          result += `\n${formatAMPM(time)}\tGroup ${j+1}\t${member}`;

          time = new Date( time.getTime()+duration );
          count++;
        });

      });

      let groupresult = "";
      if( peopleCount%groupCount == 0){
        groupresult = `[${grouped.length}] groups of [${grouped[0].length}]`;
      }else{
        //manually calculate each group composition
        grouped.forEach( (g,k)=>{
          groupresult += `[Group ${k+1}] with [${g.length}]<br>`
        });        
      }
      document.getElementById('group-result').innerHTML = groupresult;
    }else{
      list.forEach( (p, index) =>{ 
        if( breakCount && index%breakSize == 0 && index != 0){
          //break time!
          result += `\n\n${formatAMPM(time)}\tBreak for ${breakmin}min\n`;
          time = new Date( time.getTime()+breaksec );
        }

        result += `\n${formatAMPM(time)}\t${p}`;
       
        time = new Date( time.getTime()+duration );    
      });
    }

    result += `\n${formatAMPM(time)}\tend\n`;
    document.getElementById('schedule').value = result;

  });

});

function splitArray(arr, chunkCount) {
  const chunks = [];
  while(arr.length) {
    const chunkSize = Math.ceil(arr.length / chunkCount--);
    const chunk = arr.slice(0, chunkSize);
    chunks.push(chunk);
    arr = arr.slice(chunkSize);
  }
  return chunks;
}

function parseTime(s){
  var msec = s;
  var hh = Math.floor(msec / 1000 / 60 / 60);
  msec -= hh * 1000 * 60 * 60;
  var mm = Math.floor(msec / 1000 / 60);
  msec -= mm * 1000 * 60;
  var ss = Math.floor(msec / 1000);
  msec -= ss * 1000;
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ampm;
  return strTime;
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}