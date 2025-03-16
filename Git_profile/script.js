const APIURL = "https://api.github.com/users/";


getUser("itsmesajan");

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');

async function getUser(username) {
  const resp = await fetch(APIURL + username);
  const respData = await resp.json();

  createUserCard(respData);

  getRepos(username);
}

async function getRepos(username) {
  const resp = await fetch(APIURL + username + '/repos');
  const respData = await resp.json();
  
  console.log(respData);
  addReposToCard(respData);

}

function createUserCard(user){
  console.log(user);
  const cardHtml=`
    <div class="card">
    <div>
      <img class="avatar" src="${user.avatar_url}" alt="${user.name}"/>
    </div>
    <div class="user-info">
      <h2>${user.name}</h2>
      <p>${user.bio}</p>
      <ul class="info" >
        <li>${user.following}<strong>Following</strong></li>
        <li>${user.followers}<strong>Follower</strong></li>
        <li>${user.public_repos}<strong>Repos</strong></li>
      </ul>
      
      <div id="repos">
      </div>
    </div>
    </div>
  `;

  main.innerHTML= cardHtml;
}

function addReposToCard(repos){
  const reposEl = document.getElementById('repos');

  repos
  .sort((a,b)=>b.stargazer_count -a.stargazer_count)
  .slice(0,10)
  .forEach((repo) => {
    const repoEl = document.createElement('a');
    repoEl.classList.add('repo');

    repoEl.href = repo.html_url;
    repoEl.target= "_blank";
    repoEl.innerText = repo.name;

    reposEl.appendChild(repoEl);
  });
}

form.addEventListener('submit', e =>{
  e.preventDefault();

  const user = search.value;

  if(user){
    getUser(user);

    search.value = "";
  }

});