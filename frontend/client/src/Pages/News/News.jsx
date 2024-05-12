import React, { useState, useEffect } from 'react';
import FeederNav from '../../FeederNav/FeederNav';
import "./News.css"
const News = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Function to complete the link
    const completeLink = (partialLink) => {
        if (partialLink && !partialLink.startsWith('http://') && !partialLink.startsWith('https://')) {
            // Check if the partial link already contains 'euronews.com'
            if (!partialLink.includes('euronews.com')) {
                return `https://www.euronews.com${partialLink}`;
            }
        }
        return partialLink;
    };


    useEffect(() => {
        fetch('http://localhost:3000/api/news')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(data => {
                // Modify the link property of each article
                const articlesWithCompleteLinks = data.map(article => ({
                    ...article,
                    link: completeLink(article.link)
                }));

                setArticles(articlesWithCompleteLinks);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p className='text-3xl text-center mt-40 font-bold text-primary'>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    const nextSlide = () => {
        setCurrentSlide(currentSlide === articles.length - 1 ? 0 : currentSlide + 1);
    };

    const prevSlide = () => {
        setCurrentSlide(currentSlide === 0 ? articles.length - 1 : currentSlide - 1);
    };

    return (
            <div className="login-page h-[95vh]">
                <FeederNav />
                <h2 className="text-center text-2xl mb-4 mt-2 text-primary">Latest News</h2>
                <div className="carousel-container">
                    {articles.map((article, index) => (
                        <div key={index} className={`slide ${index === currentSlide ? 'active' : ''}`}>
                            <a href={article.link} target="_blank" rel="noopener noreferrer " className='cursor-pointer'>
                                <div className="image-container">
                                    <img src={article.image} alt={article.title} className="slide-image" />
                                </div>
                            </a>
                            
                            <div className="slide-content">
                                <div className='flex justify-around w-full'>
                                <button className="prev-btn transition ease-in-out delay-150 hover:opacity-80" onClick={prevSlide}><svg class="h-8 w-8 text-primary"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <circle cx="12" cy="12" r="10" />  <polyline points="12 8 8 12 12 16" />  <line x1="16" y1="12" x2="8" y2="12" /></svg></button>
                    <button className="next-btn transition ease-in-out delay-150 hover:opacity-80" onClick={nextSlide}><svg class="h-8 w-8 text-primary"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <circle cx="12" cy="12" r="10" />  <polyline points="12 16 16 12 12 8" />  <line x1="8" y1="12" x2="16" y2="12" /></svg></button>
                          
                                </div>
                                <div className='mt-10'>
                                 <p className="text-lg font-semibold">{article.title}</p>
                                <p className="text-gray-700">{article.description}</p>
                                <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-primary text-md  cursor-pointer hover:underline ">Read more</a>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                </div>
                 </div>
        );
    }
    


export default News;

