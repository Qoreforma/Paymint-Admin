import React from "react";
import { Icon } from "../../../components/Component";

const Ratings = ({ value }) => {
  let totalStars = [...Array(5 + 1).keys()].slice(1); //returns an array of numbers

  return (
    <ul className="rating">
      {totalStars.map((num, i) => {
        //return half stars
        if (i < value && i + 1 > value) {
          return (
            <li key={i}>
              <Icon name="star-half"></Icon>
            </li>
          );
          //return full star
        } else if (value >= i + 1) {
          return (
            <li key={i}>
              <Icon name="star-fill"></Icon>
            </li>
          );
        } else {
          return (
            <li key={i}>
              <Icon name="star"></Icon>
            </li>
          );
        }
      })}
    </ul>
  );
};

//if 1 greater than 1.5  and 1 + 1 < 1.5 return half

export default Ratings;
