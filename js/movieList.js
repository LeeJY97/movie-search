
// 데이터 처리
const processData = (data) => {
    clearHTML();

    data.forEach(data => {
        createHTML(data);
    });
}

// HTML Clear
function clearHTML() {
    let movieCard = document.getElementsByClassName('movie-card');
    while (movieCard.length > 0) {
        movieCard[0].parentNode.removeChild(movieCard[0]);
    }
}

// HTML Create

function createHTML(data) {
    // imgSize : [w92, w154, w185, w342, w500, w780, original]
    const imgPath = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    const imgLink = `/detail/detail.html?id=${data.id}`;
    const title = data.title;
    const release_date = data.release_date || '2024-01-01'; // 날짜 없는 애들 더미용
    const overview = data.overview;
    const popularity = data.popularity;
    const vote_average =  Math.round(data.vote_average * 10) / 10;;
    const vote_count = data.vote_count;

    const movieList = document.getElementById('movieList');

    // div.movie-card 
    let movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.id = "movieCard";

    /* * * * * * * * * * * 사진 영역 * * * * * * * * * * * * */
    // div.movie-card > div.image
    let imageDiv = document.createElement("div");
    imageDiv.classList.add("image");

    // div.movie-card > div.image > a.image
    let imageLink = document.createElement("a");
    imageLink.classList.add("image");
    imageLink.href = imgLink;
    imageLink.title = title;

    // div.movie-card > div.image > a.image > img.card-img
    let image = document.createElement("img");
    image.classList.add("card-img");
    image.src = imgPath;

    imageLink.appendChild(image);
    imageDiv.appendChild(imageLink);
    movieCard.appendChild(imageDiv);
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * */


    /* * * * * * * * * * * 정보 영역 * * * * * * * * * * * * */
    // contentDiv 요소 생성
    let contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    // h2 요소 생성 및 추가
    let h2 = document.createElement("h2");
    h2.textContent = title; // title 변수에 설정된 값을 사용
    contentDiv.appendChild(h2);

    // content-box div 요소 생성
    let contentBoxDiv = document.createElement("div");
    contentBoxDiv.classList.add("content-box");

    // 첫 번째 p 요소 생성 및 추가 (날짜)
    let p1 = document.createElement("p");
    p1.textContent = "24.04.04"; // 날짜 텍스트
    contentBoxDiv.appendChild(p1);

    // 두 번째 p 요소 생성 및 추가 (평점)
    let p2 = document.createElement("p");
    p2.textContent = vote_average; 
    contentBoxDiv.appendChild(p2);

    // content-box div를 contentDiv에 추가
    contentDiv.appendChild(contentBoxDiv);

    // movieCard에 contentDiv 추가
    movieCard.appendChild(contentDiv);
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    // 최종 추가 (movie-card 생성)    
    movieList.appendChild(movieCard);
}


// 검색 입력 이벤트
document.getElementById('inputSearch').addEventListener('input', function (e) {
    fetchAllMoviesData(this.value, processData);
});


// 메뉴 클릭 이벤트
const menuText = document.querySelectorAll('.menu-text');
menuText.forEach((target) => target.addEventListener('click', () => {
    if (target.id === "ALL") {
        fetchAllMoviesData("", processData);
    } else {
        fetchMoviesByCountry(target.id, processData)
    }

}))


// 페이지 로드 (전체데이터)
fetchAllMoviesData("", processData);