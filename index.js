
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

async function sendRequest(url){
    const res = await fetch(url);
    const data = await res.json();
    return data;
}


function getSubmissions(user){ // ONLY 10 last for debug
    return "https://codeforces.com/api/user.status?handle=" + user;// + "&from=1&count=10";
}

//https://codeforces.com/api/contest.status?contestId=566&handle=huangxiaohua

function getProblemId(problem){
    if(problem.contestId===undefined)return "BAD";
    return problem.contestId.toString()+problem.index;
}

async function getProblems(v,problems,rangeL,rangeR){
    const mapa = new Map();
    const idBom = new Map();

    for(let i=0;i<problems.length;i++){
        if(problems[i].rating == undefined)continue;
        if(problems[i].rating<rangeL)continue;
        if(problems[i].rating>rangeR)continue;
        idBom.set(getProblemId(problems[i]),1);
    }

    let tam=v.length;
    if(tam > 10){// max of 10 users:
        tam = 10;
    }
    for(let i=0;i<tam;i++){ 
        console.log(getSubmissions(v[i]));
        await sendRequest(getSubmissions(v[i])).then(
            data =>{
                if(data.status == 'OK'){
                    let vet = data.result;
                    
                    for(let j=0;j<data.result.length;j++){
                    
                        if(idBom.get(getProblemId(data.result[j].problem))!=undefined){
                            idBom.set(getProblemId(data.result[j].problem),0);
                        }
                    }
                }
            }
        );
    }
    var arr = []
    for(const [key,value] of idBom){
        if(value == 1)arr.push(key);
    }

    var shuffled = shuffle(arr);
    var resp = []
    for(let i=0;i<30 && i<shuffled.length;i++)
        resp.push(shuffled[i]);
    return resp;
}

function getProblemUrl(problem){
    for(let i=0;i<problem.length;i++){
        if(problem[i]>='A' && problem[i]<='Z'){
            var j=0;
            let contestId = problem.substring(0,i)
            let index = problem.substring(i);

            return 'https://codeforces.com/contest/'+contestId+'/problem/'+index;
        }
    }
    return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
}

function problemLink(nome,rating,problem){
    return "<p>" + nome + ": "+"<a href = "+'"'+getProblemUrl(problem)+'"'+">" + problem +", rating : "+rating+ "</a><br></p>";
}

function main(problems){

    let v1 = JSON.parse(localStorage.getItem('handles'));
    let rangeL = JSON.parse(localStorage.getItem('minimum rating'));
    let rangeR = JSON.parse(localStorage.getItem('maximum rating'));
    

    console.log(v1);
    console.log(rangeL);
    console.log(rangeR);


    const names = new Map();
    const rating = new Map();
    for(let i=0;i<problems.length;i++){
        names.set(getProblemId(problems[i]),problems[i].name);
        rating.set(getProblemId(problems[i]),problems[i].rating);
    }

    getProblems(v1,problems,rangeL,rangeR).then(
        arr =>{
            console.log(arr);
            document.getElementById('PLZ').innerHTML = "";
            document.write("<h1> Found some cool problems </h1>");
            for(let i=0;i<arr.length;i++){
                document.write(problemLink(names.get(arr[i]),rating.get(arr[i]),arr[i]));
            }
        }
    );

}

async function retornaProblemset(){
    return await sendRequest('https://codeforces.com/api/problemset.problems');
}
function runScript(){ 
    document.write('<p id = "PLZ">Please Wait<\p>');
    
    retornaProblemset().then(
        problems =>{
            main(problems.result.problems);
        }
    );
}
