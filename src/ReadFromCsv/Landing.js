import React, { useEffect, useState } from 'react';
import './Landing.css'
import { Link } from 'react-router-dom';
import { AiOutlineArrowRight } from 'react-icons/ai';
import img from './AFK.png'
const WordByWordDisplay = ({ paragraph }) => {
  const [lines, setLines] = useState([]);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Split the paragraph into an array of words
    const wordsArray = paragraph.split(' ');

    // Group words into lines of three
    const linesArray = [];
    for (let i = 0; i < wordsArray.length; i += 3) {
      linesArray.push(wordsArray.slice(i, i + 3).join(' '));
    }

    setLines(linesArray);

    // Use setInterval to display each line with a delay
    let index = 0;
    const intervalId = setInterval(() => {
      index++;
      if (index <= linesArray.length) {
        setLines(linesArray.slice(0, index));
      } else {
        clearInterval(intervalId);
        setTimeout(() => {
            setShowButton(true);
          }, 600);
      }
    }, 200); // Adjust the delay (in milliseconds) as needed
  }, [paragraph]);

  return (
    <div>
      {/* <Link to={'/read'}>
      <img className='image' src={img}/>
      </Link> */}
      {lines.map((line, index) => (
        <h1 className='text' key={index}>{line}</h1>
      ))}
    {showButton && (
        <Link to={'/read'}>
          <button className='start'>Start</button>
        </Link>
      )}
    </div>

  );
};

const Landing = () => {
  const paragraph = "In this section, we will explore a data science project that monitors the PC and provides a comprehensive report.";

  return <WordByWordDisplay paragraph={paragraph} />;
};

export default Landing;
