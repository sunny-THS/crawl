async function crawlComics() {
    let comic_name = document.querySelector('#comic_name').value;
    let chapter_name = document.querySelector('#chapter_name').value;
    console.log(comic_name, chapter_name);

    let encode_comicName = encodeURIComponent(comic_name);
    let encode_chapterName = encodeURIComponent(chapter_name);

    let uri = `https://blackdog.vip/api/get_chapter_url?comic_name=${encode_comicName}&chapter_name=${encode_chapterName}`
    console.log(uri);

    const response = await fetch(uri);
    const jsonData = await response.json();
    console.log(jsonData.url);

    // todo: implement crawl comics
    const response_comic = await fetch(`/crawl-comics?comic_name=${encode_comicName}&chapter_name=${encode_chapterName}&url=${jsonData.url}`);
    const jsonData_comic = await response_comic.json();
    console.log(jsonData_comic);
    document.querySelector('#result').textContent = jsonData_comic.message;
}

async function crawlSoundtrack() {
    let filmName = document.querySelector('#film_name').value;
    let urlSoundtrack = document.querySelector('#url_soundtrack').value;
    document.querySelector('#film_name').value = ''
    document.querySelector('#url_soundtrack').value = ''
    let slug = filmName?.toLowerCase().replace(/\s+/g, '-').replace("&", "and").replace("#", "");

    const filmInfo = await fetch(`http://45.79.198.164:5000/film/slug?slug=${slug}`);
    const filmInfoRes = await filmInfo.json();
    const filmId = filmInfoRes.id
    const filmType = filmInfoRes.type

    //crawl soundtrack 
    const data = await fetch(`/crawl-soundtracks?url=${urlSoundtrack}&film_id=${filmId}&type=${filmType}&slug=${slug}`);
    const dataSoundtrack = await data.json();
    console.log(dataSoundtrack);
}

async function crawlKenmei() {
    let urlKenmei = document.querySelector('#url_kenmei').value;
    document.querySelector('#url_kenmei').value = ''

    //crawl kenmei 
    const data = await fetch(`/crawl-kenmei?url=${urlKenmei}`);
    const dataSoundtrack = await data.json();
    console.log(dataSoundtrack);
}