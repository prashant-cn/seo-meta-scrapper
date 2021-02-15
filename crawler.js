const axios = require('axios')
const cheerio = require('cheerio');
//const url = require('url-parse');
const xlsx = require('xlsx')

//read sitename and URL's
const WB = xlsx.readFile('listofsites.xlsx')
const WS = WB.Sheets['META']
const siteList = xlsx.utils.sheet_to_json(WS)

siteList.forEach((site)=>{
    console.log(site.sitename)
    const url = site.url
    const sitename = site.sitename
    const tagsNeeded = ['description','keywords','og:title','og:description','twitter:title','twitter:description']

    ////
    fetchData(url).then((res) => {
        const html = res.data;
        const $ = cheerio.load(html);
        const contentBody = $('head');
        //console.log(contentBody)
    
        const data = []
        const obj = {}
        contentBody.each(function() {
            const metaTags = $(this).find('meta')
            metaTags.each((i, tag)=>{
                metaContent = $(tag).attr('content')
                //data.push({linkTitle})
                if($(tag).attr('name') !== undefined)
                {
                    tagType=$(tag).attr('name')
                }
                else
                {
                    tagType=$(tag).attr('property')
                }
                //console.log(`${tagType} = ${$(tag).attr('content')}`)
                //obj[tagType] = metaContent
                data.push({'Tag Name':tagType, 'Tag Value':metaContent})
            })
        });
        //console.log(obj)
        //data.push({'Key':obj[tagType], 'Value':obj[metaContent]})
        //console.log(data)

        //to filter out unnecessary data
        const filteredData = data.filter((tag)=>{
            return tagsNeeded.includes(tag['Tag Name'])
            //return tagsNeeded.indexOf(tag['Tag Name']) > -1; // also correct
        })
        console.log(filteredData)
    
        //write on excel sheet
        const newWB = xlsx.utils.book_new()
        const newWS = xlsx.utils.json_to_sheet(filteredData)
        xlsx.utils.book_append_sheet(newWB, newWS, "Meta Tags")
    
        xlsx.writeFile(newWB, `${sitename}.xlsx`)
    })
    
    async function fetchData(url){
        console.log("Crawling data...")
        // make http call to url
        let response = await axios(url).catch((err) => console.log(err));
    
        if(response.status !== 200){
            console.log("Error occurred while fetching data");
            return;
        }
        return response;
    }
    ////
})

//console.log(siteList)


