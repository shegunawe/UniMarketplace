/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/render-result-naming-convention */
import React from "react";
import { render, screen } from "@testing-library/react";
import Ratings from "./Ratings";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsStarHalf } from "react-icons/bs";

describe("Ratings Component", () => {
  const getRenderedStars = () => screen.getAllByTestId("star");

  test("renders 5 full stars when rating is 5", () => {
    render(<Ratings rating={5} />);

    const stars = getRenderedStars();
    expect(stars).toHaveLength(5);

    stars.forEach((star) => {
      expect(star.firstChild).toBeInstanceOf(AiFillStar);
    });
  });

  test("renders 4 full stars and 1 half star when rating is 4.5", () => {
    render(<Ratings rating={4.5} />);

    const stars = getRenderedStars();
    expect(stars).toHaveLength(5);

    expect(stars[4].firstChild).toBeInstanceOf(BsStarHalf); // 5th star should be half
  });

  test("renders 3 full stars and 2 outline stars when rating is 3", () => {
    render(<Ratings rating={3} />);

    const stars = getRenderedStars();
    expect(stars).toHaveLength(5);

    expect(stars[0].firstChild).toBeInstanceOf(AiFillStar);
    expect(stars[1].firstChild).toBeInstanceOf(AiFillStar);
    expect(stars[2].firstChild).toBeInstanceOf(AiFillStar);
    expect(stars[3].firstChild).toBeInstanceOf(AiOutlineStar); // 4th star outline
    expect(stars[4].firstChild).toBeInstanceOf(AiOutlineStar); // 5th star outline
  });

  test("renders 2 full stars, 1 half star, and 2 outline stars when rating is 2.5", () => {
    render(<Ratings rating={2.5} />);

    const stars = getRenderedStars();
    expect(stars).toHaveLength(5);

    expect(stars[0].firstChild).toBeInstanceOf(AiFillStar);
    expect(stars[1].firstChild).toBeInstanceOf(AiFillStar);
    expect(stars[2].firstChild).toBeInstanceOf(BsStarHalf); // 3rd star half
    expect(stars[3].firstChild).toBeInstanceOf(AiOutlineStar); // 4th star outline
    expect(stars[4].firstChild).toBeInstanceOf(AiOutlineStar); // 5th star outline
  });

  test("renders all outline stars when rating is 0", () => {
    render(<Ratings rating={0} />);

    const stars = getRenderedStars();
    expect(stars).toHaveLength(5);

    stars.forEach((star) => {
      expect(star.firstChild).toBeInstanceOf(AiOutlineStar);
    });
  });

  test("renders stars with correct styles", () => {
    render(<Ratings rating={4} />);

    const stars = getRenderedStars();
    stars.forEach((star) => {
      expect(star).toHaveClass("mr-2 cursor-pointer");
    });
  });
});
