document.addEventListener('DOMContentLoaded', () => {
  const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

  function initialize(json) {
    const info = json.description.match(/\S+pdf/)[0].split('(')[1];
    const GDP = json.name.split(',')[0];
    const { data } = json;

    // Chart dimensions
    const w = 800;
    const h = 600;
    const padding = { h: 100, w: 60 };

    // Format the date
    const formatDate = (date) => {
      const year = date.split('-')[0];
      let quarter = parseInt(date.split('-')[1], 10);

      switch (quarter) {
        case 4:
          quarter = 2;
          break;
        case 7:
          quarter = 3;
          break;
        case 10:
          quarter = 4;
          break;
        default:
          quarter = 1;
          break;
      }

      return `Q${quarter} ${year}`;
    };

    // Format the GDP value
    const formatGdp = val => val.toLocaleString('en', { style: 'currency', currency: 'USD' });

    // Tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0);

    // Scaling
    const xScale = d3.scaleTime()
      .domain([d3.min(data, d => new Date(d[0])), d3.max(data, d => new Date(d[0]))])
      .range([padding.w, w - padding.w]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[1])])
      .range([h - padding.h, padding.h]);

    // Chart
    const svg = d3.select('body')
      .append('svg')
      .attr('width', w)
      .attr('height', h)
      .attr('class', 'chart');

    // Bars
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('data-date', d => d[0])
      .attr('data-gdp', d => d[1])
      .attr('x', d => xScale(new Date(d[0])))
      .attr('y', d => yScale(d[1]))
      .attr('width', 2.5)
      .attr('height', d => h - padding.h - yScale(d[1]))
      .attr('class', 'bar')
      .on('mouseover', (d) => {
        tooltip.attr('data-date', d[0]);
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(`${formatDate(d[0])}<br>${formatGdp(d[1])} Billion`)
          .style('left', `${d3.event.pageX + 5}px`)
          // .style('top', (d3.event.pageY - 65) + 'px'); // 65: height + padding #tooltip
          .style('top', `${h - padding.h}px`);
      })
      .on('mouseout', (d) => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // X axis
    const xAxis = d3.axisBottom(xScale);

    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${h - padding.h})`)
      .call(xAxis);

    // Y axis
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding.w}, 0)`)
      .call(yAxis);

    // Inline y-axis GDP
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('transform', `translate(${padding.w + 20}, ${padding.h}) rotate(-90)`)
      .text(GDP);

    // Title
    svg.append('text')
      .attr('x', (w / 2))
      .attr('y', (padding.h / 1.5))
      .attr('id', 'title')
      .attr('text-anchor', 'middle')
      .text(`United States ${json.code}`);

    // Source
    svg.append('text')
      .attr('x', (w - padding.w))
      .attr('y', (h - padding.h / 2))
      .attr('text-anchor', 'end')
      .text(`More information: ${info}`);
  }

  fetch(url)
    .then(res => res.json())
    .then(data => initialize(data))
    .catch(err => console.log(err));
});
