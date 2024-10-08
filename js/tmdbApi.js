import constants from './constants.js';
const { OPTIONS, API_KEY, BASE_URL, LANGUAGE, WITHOUT_GENRES, COUNTRY_CODES, DUMMY_GENRES } = constants;

// tmdbapi.js 함수 모듈로 뺴라
// 그리고 movieList, detail.js에서 갖다 써라
function generateUrl(type, { movieId = null, actorId = null, countryCode = null, genres = null, sort, page = 1 } = {}) {
    switch (type) {
        case 'topRated':
            return `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=${LANGUAGE}&with_origin_country=${countryCode}&page=${page}`;
        case 'upcoming':
            return `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=${LANGUAGE}&page=${page}`;
        case 'genres':
            if (!genres || !countryCode || !page) throw new Error('무슨 장르 보고싶은데?');
            return `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_origin_country=${countryCode}&with_genres=${genres[0].id}&without_genres=${WITHOUT_GENRES}&page=${page}&sort_by=popularity.desc`;
        case 'detail':
            if (!movieId) throw new Error('Movie ID가 없다네');
            return `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=${LANGUAGE}`;
        case 'byCountries':
            if (!countryCode || !genres) throw new Error('나라별 영화는 countryCode랑 genres가 필수이거늘');
            if (countryCode === "JP") return `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_origin_country=${countryCode}&with_genres=16&without_genres=${WITHOUT_GENRES}}&page=${page}`;
            if (countryCode !== "JP") return `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_origin_country=${countryCode}&with_genres=${genres[0].id}&without_genres=${WITHOUT_GENRES}}&page=${page}`
        case 'credit':
            if (!movieId) throw new Error('출연진을 보려면 movie ID를 넣어야지');
            return `${BASE_URL}/movie/${movieId}/credits?language=${LANGUAGE}&api_key=${API_KEY}`;
        case 'actorImg':
            if (!actorId) throw new Error('배우사진을 보려면 actor ID를 넣어야지');
            return `${BASE_URL}/person/${actorId}/images?api_key=${API_KEY}`;
        case 'ALL':
            if (!countryCode) throw new Error('전체영화 목록을 보려면 countryCode를 잊지마');
            return COUNTRY_CODES.map((code) => {
                if (code === "JP") return `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_origin_country=${code}&with_genres=16&without_genres=${WITHOUT_GENRES}}&sort_by=vote_count.desc`;
                return `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_origin_country=${code}&with_genres=${genres[0].id}&without_genres=${WITHOUT_GENRES}&sort_by=vote_count.desc`;
            });
        case 'TV':
            if (!countryCode || !genres) throw new Error('TV 프로그램을 보려면 장르와, 나라코드');
            return `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=${LANGUAGE}&with_genres=${genres}&with_origin_country=${countryCode}&sort_by=${sort}.desc&page=${page}`;
        default:
            throw new Error('url 어딘가 에러');
    }
}


/********************************* 메인 페이지 **********************************/
async function fetchAllMoviesData(searchKey, callback) {
    const urlArr = generateUrl("ALL", { countryCode: "ALL", genres: DUMMY_GENRES });

    try {
        const allMovieDataPromise = urlArr.map(url => fetch(url).then(res => res.json()));
        const movieListOfCountrires = await Promise.all(allMovieDataPromise);

        // flatMap: map과 비슷하지만 배열안의 배열을 리턴하면 map 같은 경우 중첩 배열이 생성되지만 
        //          flatMap은 전개연산자를 쓴것처럼 배열을 평탄화해서 리턴해줌 (1단계 중첩만)
        //      ex) map => [[1], [2], [3]] / flatMap => [1, 2, 3];
        const mergedResults = movieListOfCountrires.flatMap(data => data.results);

        sortByPopularityDesc(mergedResults, searchKey, callback);

    } catch (e) {
        console.log("전체 국가 api 에러");
    }
}

async function fetchMoviesByCountry(countryConfig, callback) {
    let url;
    const { countryCode, page } = countryConfig;

    if (countryCode === "JP") {
        url = generateUrl("byCountries", { countryCode, genres: DUMMY_GENRES, page });
    } else {
        url = generateUrl("byCountries", { countryCode, genres: DUMMY_GENRES, page });
    }

    try {
        const res = await fetch(url);
        const data = await res.json();

        callback([...data.results]);
    } catch (e) {
        console.log("나라별 api 에러")
    }
};

function searchAllData(data, searchKey) {
    return data.filter((value) => {
        const title = value.title.replace(/ /g, '').replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/ ]/g, '');
        return H.includesByCho(searchKey.toUpperCase(), title.toUpperCase())
    })
}

function sortByPopularityDesc(data, searchKey, callback) {
    data.sort((a, b) => b.popularity - a.popularity);

    if (searchKey !== '') {
        data = searchAllData(data, searchKey);
    }
    callback(data);
}


/********************************** 상세페이지 **********************************/
async function fetchTVData(searchCriteria, callback) {
    let data;
    let url = '';
    const { countryCode, genres, page } = searchCriteria;
    let sort = "popularity";

    if (countryCode === 'US') {
        sort = 'vote_count';    // 미국이면 명작순 정렬
        url = generateUrl("TV", { countryCode, genres, page, sort });
    } else {
        url = generateUrl("TV", { countryCode, genres, page, sort });
    }

    try {
        const res = await fetch(url);
        data = await res.json();
        data = setTitleOfTvData([...data.results]);

    } catch (e) {
        console.log("TV api 에러")
    }

    callback(data);
}

function setTitleOfTvData(data) {
    data.forEach(item => {
        item.title = item.name;
    })
    return data;
}

async function fetchTypeMoviesData(searchCriteria, callback) {
    const { name, countryCode, genres, page } = searchCriteria;
    let url;
    switch (name) {
        case 'topRated':
            url = generateUrl('topRated', { countryCode, page });
            break;
        case 'genres':
            url = generateUrl('genres', { countryCode, genres, page });
            break;
        case 'upcoming':
            url = generateUrl('upcoming', { page });
            break;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();

        callback([...data.results]);
    } catch (error) {
        console.log("유형별 데이터 에러");
    }
}

async function fetchDetailMovieData(movieId, processMovieData) {
    //  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=ko-KR`;
    const url = generateUrl("detail", { movieId });
    const data = await fetch(url).then(data => data.json());

    processMovieData(data);
}

async function fetchActorsData(movieId, callback) {
    const url = generateUrl("credit", { movieId });
    const credits = await fetch(url).then(data => data.json());
    let actors = credits.cast.map(({ id, name, file_path }) => ({ id, name, file_path })).slice(0, 15);

    const results = await Promise.all(actors.map((actor) => fetchActorImg(actor)));
    callback(results);
}

async function fetchActorImg(actor) {
    const url = generateUrl("actorImg", { actorId: actor.id });
    const response = await fetch(url);
    const data = await response.json();

    if (data.profiles.length === 0) {
        return actor;
    }

    actor.file_path = data.profiles[0].file_path;

    return actor;
}


export {
    fetchAllMoviesData,
    fetchMoviesByCountry,
    searchAllData,
    fetchTVData,
    fetchTypeMoviesData,
    fetchDetailMovieData,
    fetchActorsData,
}