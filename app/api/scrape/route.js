// app/api/scrape/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const page = searchParams.get('page') || '1';
  const genre = searchParams.get('genre');
  const type = searchParams.get('type') || 'home';

  if (!url && type === 'home') {
    const baseUrl = `https://nekopoi.care`;
    return scrapeHome(baseUrl, page);
  }

  if (genre) {
    return scrapeGenre(genre, page);
  }

  if (url) {
    return scrapeDetail(url);
  }

  return NextResponse.json({ error: 'Parameter tidak valid' }, { status: 400 });
}

async function scrapeHome(baseUrl, page) {
  try {
    const targetUrl = page === '1' ? baseUrl : `${baseUrl}/page/${page}`;
    const { data } = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const items = [];
    
    $('.eropost').each((index, element) => {
      const title = $(element).find('.title a').text().trim();
      const link = $(element).find('.title a').attr('href');
      const thumbnail = $(element).find('.img-thumb img').attr('src');
      const genreList = [];
      
      $(element).find('.cat-links a').each((i, el) => {
        genreList.push($(el).text().trim());
      });
      
      items.push({
        title,
        link,
        thumbnail,
        genres: genreList,
        type: 'episode'
      });
    });
    
    // Get pagination
    const pagination = [];
    $('.pagination a').each((i, el) => {
      pagination.push({
        page: $(el).text().trim(),
        url: $(el).attr('href')
      });
    });
    
    // Get genres
    const genres = [];
    $('.menu-category-kanan ul li a').each((i, el) => {
      genres.push({
        name: $(el).text().trim(),
        slug: $(el).attr('href')?.split('/category/')[1]?.replace('/', '')
      });
    });
    
    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination,
        genres,
        current_page: parseInt(page),
        total_items: items.length
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function scrapeGenre(genre, page) {
  try {
    const targetUrl = page === '1' 
      ? `https://nekopoi.care/category/${genre}`
      : `https://nekopoi.care/category/${genre}/page/${page}`;
    
    const { data } = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const items = [];
    
    $('.eropost').each((index, element) => {
      const title = $(element).find('.title a').text().trim();
      const link = $(element).find('.title a').attr('href');
      const thumbnail = $(element).find('.img-thumb img').attr('src');
      const genreList = [];
      
      $(element).find('.cat-links a').each((i, el) => {
        genreList.push($(el).text().trim());
      });
      
      items.push({
        title,
        link,
        thumbnail,
        genres: genreList,
        type: 'genre'
      });
    });
    
    return NextResponse.json({
      success: true,
      data: {
        items,
        genre,
        current_page: parseInt(page),
        total_items: items.length
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function scrapeDetail(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    // Get title
    const title = $('.post-title h1').text().trim();
    
    // Get thumbnail
    const thumbnail = $('.wp-post-image').attr('src');
    
    // Get genres
    const genres = [];
    $('.cat-links a').each((i, el) => {
      genres.push($(el).text().trim());
    });
    
    // Get streams
    const streams = [];
    
    // Stream 1 (KStream)
    $('.responsive-embed iframe').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('http')) {
        streams.push({
          player: 'KStream',
          url: src
        });
      }
    });
    
    // Stream 2 (Mirror)
    $('a[href*="nekopoi.care/go?to="]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        streams.push({
          player: 'Mirror',
          url: href
        });
      }
    });
    
    // Get download links
    const downloads = [];
    $('.dlbox a').each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href');
      if (href && text) {
        downloads.push({
          quality: text,
          url: href
        });
      }
    });
    
    // Get episode list
    const episodes = [];
    $('.eplister ul li').each((i, el) => {
      const epTitle = $(el).find('.epl-title').text().trim();
      const epDate = $(el).find('.epl-date').text().trim();
      const epLink = $(el).find('a').attr('href');
      
      episodes.push({
        title: epTitle,
        date: epDate,
        link: epLink
      });
    });
    
    // Get related posts
    const related = [];
    $('.related-posts .item-related').each((i, el) => {
      const relTitle = $(el).find('.title-related a').text().trim();
      const relLink = $(el).find('.title-related a').attr('href');
      const relThumb = $(el).find('.img-related img').attr('src');
      
      related.push({
        title: relTitle,
        link: relLink,
        thumbnail: relThumb
      });
    });
    
    return NextResponse.json({
      success: true,
      data: {
        title,
        thumbnail,
        genres,
        streams,
        downloads,
        episodes,
        related,
        source_url: url
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
