const { type } = require("os");
const puppeteer = require("puppeteer");

async function extractItems(page) {
  const reviews = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".jftiEf")).map((el) => {
      return {
        user: {
          name: el.querySelector(".d4r55")?.textContent.trim(),
          thumbnail: el.querySelector("a.WEBjve img")?.getAttribute("src"),
          localGuide:
            el.querySelector(".RfnDt span:nth-child(1)")?.style.display ===
            "none"
              ? false
              : true,
          reviews: el
            .querySelector(".RfnDt span:nth-child(2)")
            ?.textContent.replace("·", "")
            .replace("reviews", "")
            .trim(),
          link: el.querySelector("a.WEBjve")?.getAttribute("href"),
        },
        rating: el.querySelector(".kvMYJc")?.getAttribute("aria-label").trim(),
        date: el.querySelector(".rsqaWe")?.textContent,
        review: el.querySelector(".wiI7pd")?.textContent.trim(),
        // images: Array.from(el.querySelectorAll(".KtCyie button")).length
        images: Array.from(el.querySelectorAll(".KtCyie button")).map((el) => {
          return {
            thumbnail: getComputedStyle(el)
              .backgroundImage.split('")')[0]
              .replace('url("', ""),
          };
        }),

        //   : "",
      };
    });
  });
  //   reviews.forEach((review) => {
  //     console.log(review.images);
  //   });
  return reviews;
}

const scrollPage = async (page, scrollContainer, itemTargetCount) => {
  let items = [];
  let previousHeight = await page.evaluate(
    `document.querySelector("${scrollContainer}").scrollHeight`
  );
  while (itemTargetCount > items.length) {
    items = await extractItems(page);
    await page.evaluate(
      `document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`
    );
    await page.evaluate(
      `document.querySelector("${scrollContainer}").scrollHeight > ${previousHeight}`
    );
    await page.waitForTimeout(2000);
  }
  return items;
};

const getMapsData = async (number, link, name) => {
  try {
    let url = link;
    browser = await puppeteer.launch({
      args: ["--disabled-setuid-sandbox", "--no-sandbox"],
      headless: false,
    });
    const [page] = await browser.pages();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);

    let ratings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".PPCwl")).map((el) => {
        return {
          avg_rating: el.querySelector(".fontDisplayLarge")?.textContent.trim(),
          total_reviews: el.querySelector(".fontBodySmall")?.textContent.trim(),
          five_stars: el
            .querySelector(".ExlQHd tbody tr:nth-child(1)")
            .getAttribute("aria-label")
            .split("stars, ")[1]
            .trim(),
          four_stars: el
            .querySelector(".ExlQHd tbody tr:nth-child(2)")
            .getAttribute("aria-label")
            .split("stars, ")[1]
            .trim(),
          three_stars: el
            .querySelector(".ExlQHd tbody tr:nth-child(3)")
            .getAttribute("aria-label")
            .split("stars, ")[1]
            .trim(),
          two_stars: el
            .querySelector(".ExlQHd tbody tr:nth-child(4)")
            .getAttribute("aria-label")
            .split("stars, ")[1]
            .trim(),
          one_stars: el
            .querySelector(".ExlQHd tbody tr:nth-child(5)")
            .getAttribute("aria-label")
            .split("stars, ")[1]
            .trim(),
        };
      });
    });

    console.log(ratings);
    let data = await scrollPage(page, ".DxyBCb", number);
    // Thêm thuộc tính images từ reviews vào mảng data
    let dataJson = [];
    // const ExcelJS = require("exceljs");
    // const fs = require("fs");
    data.forEach((item, index) => {
      //   const myJSON = JSON.stringify(item);
      //   console.log(item);
      const name = item["user"]["name"];
      const rating = item["rating"];
      const images = item["images"];
      const review = item["review"];

      let finalImagesArray = [];
      for (let i = 0; i < images.length; i++) {
        finalImagesArray.push(images[i]["thumbnail"]);
      }
      if (images.length == 0) {
        finalImagesArray = "null";
      }
      let object = {
        name: name,
        rating: rating,
        review: review,
        images: finalImagesArray,
      };
      dataJson.push(object);
      //   console.log(object);

      //   item.images = ratings[index].images;
    });
    console.log(dataJson);
    var dictstring = JSON.stringify(dataJson);
    // console.log(dictstring)
    var fs = require("fs");
    fs.writeFile(name, dictstring, function (err, result) {
      if (err) console.log("error", err);
    });

    await browser.close();
  } catch (e) {
    console.log(e);
  }
};

let number = 2800; // so luong comment muon lay
let link =
  "https://www.google.com/maps/place/B%E1%BB%8Bnh+vi%E1%BB%87n+Ch%E1%BB%A3+R%E1%BA%ABy/@10.7578369,106.6569462,17z/data=!4m8!3m7!1s0x31752ef1efebf7d7:0x9014ce53b8910a58!8m2!3d10.7578369!4d106.6595211!9m1!1b1!16s%2Fm%2F02rw0f9?entry=ttu"; //duong link
let name = "Cho_ray.json"; // ghi ten file.json
getMapsData(number, link, name);
