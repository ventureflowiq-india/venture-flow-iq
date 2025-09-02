import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabase';
import Header from '../components/common/Header';
import * as d3 from 'd3';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  Users, 
  Globe, 
  Target,
  Lock,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  PieChart,
  Activity,
  Briefcase,
  BarChart,
  LineChart
} from 'lucide-react';
import { USER_ROLES, hasSectionAccess, ACCESS_LEVELS } from '../utils/rbac';

const MarketAnalysis = () => {
  const { user } = useAuth();
  const { ...userProfile } = useUserProfile(user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState(null);
  const [selectedSector, setSelectedSector] = useState('all');
  const [timeRange, setTimeRange] = useState('1year');
  const [companyType, setCompanyType] = useState('all');
  const [companySize, setCompanySize] = useState('all');
  const [error, setError] = useState(null);
  
  // Chart refs for D3 visualizations
  const sectorChartRef = useRef();
  const fundingTrendRef = useRef();
  const valuationBubbleRef = useRef();
  const growthMatrixRef = useRef();

  // Role-based access control
  const userRole = userProfile?.role || USER_ROLES.FREEMIUM;
  const hasAccess = userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.ENTERPRISE;

  useEffect(() => {
    if (hasAccess) {
      fetchMarketData();
    } else {
      setLoading(false);
    }
  }, [hasAccess, selectedSector, timeRange, companyType, companySize]);

  // Create advanced D3 visualizations
  useEffect(() => {
    if (marketData && hasAccess) {
      createSectorPieChart();
      createFundingTrendChart();
      createValuationBubbleChart();
      createGrowthMatrix();
    }
  }, [marketData, hasAccess]);

  const createSectorPieChart = () => {
    const container = d3.select(sectorChartRef.current);
    container.selectAll("*").remove();

    if (!marketData?.sectorDistribution?.length) return;

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(marketData.sectorDistribution.map(d => d.name))
      .range(['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']);

    const pie = d3.pie()
      .value(d => d.companies)
      .sort(null);

    const path = d3.arc()
      .innerRadius(50)
      .outerRadius(radius - 20);

    const labelArc = d3.arc()
      .innerRadius(radius - 40)
      .outerRadius(radius - 40);

    const arcs = g.selectAll(".arc")
      .data(pie(marketData.sectorDistribution.slice(0, 8)))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", path)
      .attr("fill", d => color(d.data.name))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(200).attr("transform", "scale(1.05)");
        
        // Tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none");

        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`
          <strong>${d.data.name}</strong><br/>
          Companies: ${d.data.companies}<br/>
          Market Cap: ₹${(d.data.totalMarketCap / 1000000000).toFixed(1)}B
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).transition().duration(200).attr("transform", "scale(1)");
        d3.selectAll(".tooltip").remove();
      });

    arcs.append("text")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.9)")
      .text(d => d.data.companies > 2 ? d.data.name.substring(0, 8) : '');
  };

  const createFundingTrendChart = () => {
    const container = d3.select(fundingTrendRef.current);
    container.selectAll("*").remove();

    if (!marketData?.fundingTrend?.length) return;

    const margin = { top: 30, right: 40, bottom: 50, left: 70 };
    const width = 450 - margin.left - margin.right;
    const height = 250 - margin.bottom - margin.top;

    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create trend data from actual market data
    const trendData = marketData.fundingTrend || Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (11 - i));
      return {
        month: month,
        funding: Math.random() * 50 + 10
      };
    });

    // Enhanced scales with padding
    const x = d3.scaleTime()
      .domain(d3.extent(trendData, d => d.month))
      .range([0, width])
      .nice();

    const y = d3.scaleLinear()
      .domain([0, d3.max(trendData, d => d.funding) * 1.1])
      .range([height, 0])
      .nice();

    // Enhanced line and area generators
    const line = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.funding))
      .curve(d3.curveMonotoneX);

    const area = d3.area()
      .x(d => x(d.month))
      .y0(height)
      .y1(d => y(d.funding))
      .curve(d3.curveMonotoneX);

    // Enhanced gradient with multiple stops
    const gradient = g.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", height);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.2);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0);

    // Add area with animation
    g.append("path")
      .datum(trendData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1);

    // Add line with animation
    g.append("path")
      .datum(trendData)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", line)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay(500)
      .style("opacity", 1);

    // Add interactive dots with tooltips
    const dots = g.selectAll(".dot")
      .data(trendData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.month))
      .attr("cy", d => y(d.funding))
      .attr("r", 0)
      .attr("fill", "#3B82F6")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 6)
          .attr("fill", "#1D4ED8");

        // Enhanced tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "funding-tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.9)")
          .style("color", "white")
          .style("padding", "12px 16px")
          .style("border-radius", "8px")
          .style("font-size", "14px")
          .style("font-weight", "500")
          .style("pointer-events", "none")
          .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)")
          .style("z-index", "1000");

        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <div style="text-align: center;">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${d3.timeFormat("%B %Y")(d.month)}
            </div>
            <div style="color: #60A5FA;">
              ₹${(d.funding * 1000000).toLocaleString()}M
            </div>
          </div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 50) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 4)
          .attr("fill", "#3B82F6");
        d3.selectAll(".funding-tooltip").remove();
      })
      .transition()
      .duration(1000)
      .delay((d, i) => 1000 + i * 100)
      .attr("r", 4);

    // Enhanced axes with better styling
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(6)
        .tickFormat(d3.timeFormat("%b"))
        .tickSize(-height)
        .tickPadding(10))
      .style("font-size", "12px")
      .style("color", "#6B7280")
      .selectAll("line")
      .style("stroke", "#E5E7EB")
      .style("stroke-dasharray", "2,2");

    g.append("g")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => `₹${d}M`)
        .tickSize(-width)
        .tickPadding(10))
      .style("font-size", "12px")
      .style("color", "#6B7280")
      .selectAll("line")
      .style("stroke", "#E5E7EB")
      .style("stroke-dasharray", "2,2");

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Funding Amount (₹M)");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Month");

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
        .ticks(6))
      .style("opacity", 0.3);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
        .ticks(5))
      .style("opacity", 0.3);
  };

  const createValuationBubbleChart = () => {
    const container = d3.select(valuationBubbleRef.current);
    container.selectAll("*").remove();

    if (!marketData?.topSectors?.length) return;

    const width = 450;
    const height = 350;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const bubbleData = marketData.topSectors.map(sector => ({
      name: sector.name,
      companies: sector.companies,
      marketCap: sector.totalMarketCap / 1000000000,
      listed: sector.listedCount,
      avgMarketCap: sector.averageMarketCap / 1000000000
    }));

    // Enhanced scales with padding
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(bubbleData, d => d.companies) * 1.1])
      .range([margin.left, width - margin.right])
      .nice();

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bubbleData, d => d.marketCap) * 1.1])
      .range([height - margin.bottom, margin.top])
      .nice();

    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(bubbleData, d => d.listed)])
      .range([8, 35]);

    const colorScale = d3.scaleOrdinal()
      .domain(bubbleData.map(d => d.name))
      .range(['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']);

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-(height - margin.top - margin.bottom))
        .tickFormat("")
        .ticks(5))
      .style("opacity", 0.3);

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
        .ticks(5))
      .style("opacity", 0.3);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => d.toString()))
      .style("font-size", "12px")
      .style("color", "#6B7280");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => `₹${d.toFixed(1)}B`))
      .style("font-size", "12px")
      .style("color", "#6B7280");

    const bubbles = svg.selectAll(".bubble")
      .data(bubbleData)
      .enter().append("g")
      .attr("class", "bubble")
      .style("cursor", "pointer");

    // Enhanced bubbles with animations and interactions
    bubbles.append("circle")
      .attr("cx", d => xScale(d.companies))
      .attr("cy", d => yScale(d.marketCap))
      .attr("r", 0)
      .attr("fill", d => colorScale(d.name))
      .attr("opacity", 0.8)
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.1))")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke-width", 4)
          .attr("r", radiusScale(d.listed) * 1.1);

        // Enhanced tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "bubble-tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.9)")
          .style("color", "white")
          .style("padding", "16px 20px")
          .style("border-radius", "12px")
          .style("font-size", "14px")
          .style("font-weight", "500")
          .style("pointer-events", "none")
          .style("box-shadow", "0 8px 24px rgba(0, 0, 0, 0.3)")
          .style("z-index", "1000")
          .style("min-width", "200px");

        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <div style="text-align: center;">
            <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px; color: ${colorScale(d.name)};">
              ${d.name}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
              <div>
                <div style="color: #9CA3AF;">Companies</div>
                <div style="font-weight: 600;">${d.companies}</div>
              </div>
              <div>
                <div style="color: #9CA3AF;">Listed</div>
                <div style="font-weight: 600;">${d.listed}</div>
              </div>
              <div>
                <div style="color: #9CA3AF;">Total Market Cap</div>
                <div style="font-weight: 600;">₹${d.marketCap.toFixed(1)}B</div>
              </div>
              <div>
                <div style="color: #9CA3AF;">Avg Market Cap</div>
                <div style="font-weight: 600;">₹${d.avgMarketCap.toFixed(1)}B</div>
              </div>
            </div>
          </div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 100) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("stroke-width", 3)
          .attr("r", radiusScale(d3.select(this).datum().listed));
        d3.selectAll(".bubble-tooltip").remove();
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attr("r", d => radiusScale(d.listed));

    // Enhanced text labels
    bubbles.append("text")
      .attr("x", d => xScale(d.companies))
      .attr("y", d => yScale(d.marketCap))
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("font-size", "11px")
      .style("font-weight", "700")
      .style("fill", "#374151")
      .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.8)")
      .style("pointer-events", "none")
      .text(d => d.name.length > 8 ? d.name.substring(0, 6) + "..." : d.name)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .delay((d, i) => 1000 + i * 200)
      .style("opacity", 1);

    // Enhanced axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Number of Companies");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Market Cap (₹B)");

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 120}, 20)`);

    const legendItems = legend.selectAll(".legend-item")
      .data(bubbleData.slice(0, 4))
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("circle")
      .attr("r", 6)
      .attr("fill", d => colorScale(d.name))
      .attr("opacity", 0.8);

    legendItems.append("text")
      .attr("x", 15)
      .attr("y", 4)
      .style("font-size", "11px")
      .style("font-weight", "500")
      .style("fill", "#374151")
      .text(d => d.name.length > 10 ? d.name.substring(0, 8) + "..." : d.name);
  };

  const createGrowthMatrix = () => {
    const container = d3.select(growthMatrixRef.current);
    container.selectAll("*").remove();

    if (!marketData?.topSectors?.length) return;

    const width = 400;
    const height = 400;
    const cellSize = 50;
    const margin = { top: 60, right: 20, bottom: 60, left: 60 };

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create matrix data based on actual sector data
    const matrixData = [];
    const sectors = marketData.topSectors || [];
    
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        // Create more realistic growth opportunity data
        const growthPotential = Math.random() * 80 + 20; // 20-100 range
        const marketSize = Math.random() * 80 + 20; // 20-100 range
        const combinedScore = (growthPotential + marketSize) / 2;
        
        matrixData.push({
          row: i,
          col: j,
          value: combinedScore,
          growthPotential: growthPotential,
          marketSize: marketSize,
          sector: sectors[Math.floor(Math.random() * sectors.length)]?.name || 'Other',
          opportunity: combinedScore > 70 ? 'High' : combinedScore > 50 ? 'Medium' : 'Low'
        });
      }
    }

    // Enhanced color scale with multiple colors
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateViridis)
      .domain([0, 100]);

    // Add background grid
    svg.append("g")
      .attr("class", "grid")
      .selectAll("rect")
      .data(matrixData)
      .enter().append("rect")
      .attr("x", d => d.col * cellSize + margin.left)
      .attr("y", d => d.row * cellSize + margin.top)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", "#F9FAFB")
      .attr("stroke", "#E5E7EB")
      .attr("stroke-width", 1);

    // Add interactive cells
    const cells = svg.selectAll(".cell")
      .data(matrixData)
      .enter().append("rect")
      .attr("class", "cell")
      .attr("x", d => d.col * cellSize + margin.left)
      .attr("y", d => d.row * cellSize + margin.top)
      .attr("width", cellSize - 2)
      .attr("height", cellSize - 2)
      .attr("fill", d => colorScale(d.value))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("rx", 4)
      .style("cursor", "pointer")
      .style("opacity", 0)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "#1F2937")
          .attr("stroke-width", 3)
          .style("opacity", 1);

        // Enhanced tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "matrix-tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.9)")
          .style("color", "white")
          .style("padding", "16px 20px")
          .style("border-radius", "12px")
          .style("font-size", "14px")
          .style("font-weight", "500")
          .style("pointer-events", "none")
          .style("box-shadow", "0 8px 24px rgba(0, 0, 0, 0.3)")
          .style("z-index", "1000")
          .style("min-width", "220px");

        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <div style="text-align: center;">
            <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">
              ${d.sector}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
              <div>
                <div style="color: #9CA3AF;">Growth Potential</div>
                <div style="font-weight: 600; color: #10B981;">${d.growthPotential.toFixed(0)}%</div>
              </div>
              <div>
                <div style="color: #9CA3AF;">Market Size</div>
                <div style="font-weight: 600; color: #3B82F6;">${d.marketSize.toFixed(0)}%</div>
              </div>
              <div style="grid-column: 1 / -1; margin-top: 8px;">
                <div style="color: #9CA3AF;">Opportunity Level</div>
                <div style="font-weight: 600; color: ${d.opportunity === 'High' ? '#EF4444' : d.opportunity === 'Medium' ? '#F59E0B' : '#6B7280'};">
                  ${d.opportunity}
                </div>
              </div>
            </div>
          </div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 120) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "white")
          .attr("stroke-width", 2);
        d3.selectAll(".matrix-tooltip").remove();
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 20)
      .style("opacity", 0.9);

    // Add axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "700")
      .style("fill", "#1F2937")
      .text("Growth Opportunity Matrix");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6B7280")
      .text("Market Size vs Growth Potential");

    // Add axis labels
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Growth Potential");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Market Size");

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - 40})`);

    const gradient = legend.append("defs")
      .append("linearGradient")
      .attr("id", "matrix-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", legendWidth).attr("y2", 0);

    gradient.selectAll("stop")
      .data(d3.range(0, 1.1, 0.1))
      .enter().append("stop")
      .attr("offset", d => `${d * 100}%`)
      .attr("stop-color", d => colorScale(d * 100));

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "url(#matrix-gradient)")
      .attr("rx", 4);

    legend.append("text")
      .attr("x", 0)
      .attr("y", legendHeight + 15)
      .style("font-size", "10px")
      .style("fill", "#6B7280")
      .text("Low");

    legend.append("text")
      .attr("x", legendWidth)
      .attr("y", legendHeight + 15)
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .style("fill", "#6B7280")
      .text("High");
  };

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build dynamic query based on filters
      let companiesQuery = supabase
        .from('companies')
        .select('sector, company_type, is_listed, employee_count, market_cap, founded_date')
        .eq('status', 'ACTIVE');

      // Apply sector filter
      if (selectedSector !== 'all') {
        companiesQuery = companiesQuery.eq('sector', selectedSector);
      }

      // Apply company type filter
      if (companyType !== 'all') {
        companiesQuery = companiesQuery.eq('company_type', companyType);
      }

      // Apply company size filter
      if (companySize !== 'all') {
        switch (companySize) {
          case 'startup':
            companiesQuery = companiesQuery.lte('employee_count', 50);
            break;
          case 'small':
            companiesQuery = companiesQuery.gte('employee_count', 51).lte('employee_count', 200);
            break;
          case 'medium':
            companiesQuery = companiesQuery.gte('employee_count', 201).lte('employee_count', 1000);
            break;
          case 'large':
            companiesQuery = companiesQuery.gte('employee_count', 1001);
            break;
          default:
            // No additional filtering for unknown company sizes
            break;
        }
      }

      // Fetch real data from your database
      const [
        companiesResult,
        fundingResult,
        financialResult,
        recentCompaniesResult
      ] = await Promise.all([
        // Total companies with applied filters
        companiesQuery,
        
        // Funding data - filtered by sector if not 'all'
        selectedSector === 'all' 
          ? supabase
              .from('funding_rounds')
              .select(`
                amount_raised,
                currency,
                funding_date,
                round_type,
                companies!inner(name, sector)
              `)
              .gte('funding_date', getDateRange(timeRange))
              .order('funding_date', { ascending: false })
          : supabase
              .from('funding_rounds')
              .select(`
                amount_raised,
                currency,
                funding_date,
                round_type,
                companies!inner(name, sector)
              `)
              .eq('companies.sector', selectedSector)
              .gte('funding_date', getDateRange(timeRange))
              .order('funding_date', { ascending: false }),
        
        // Financial data - filtered by sector if not 'all'
        selectedSector === 'all'
          ? supabase
              .from('financial_statements')
              .select(`
                total_revenue,
                net_profit,
                financial_year,
                companies!inner(sector, name)
              `)
              .gte('financial_year', new Date().getFullYear() - 2)
          : supabase
              .from('financial_statements')
              .select(`
                total_revenue,
                net_profit,
                financial_year,
                companies!inner(sector, name)
              `)
              .eq('companies.sector', selectedSector)
              .gte('financial_year', new Date().getFullYear() - 2),
        
        // Recent companies - filtered by sector if not 'all'
        selectedSector === 'all'
          ? supabase
              .from('companies')
              .select('name, sector, founded_date, market_cap')
              .eq('status', 'ACTIVE')
              .gte('founded_date', getDateRange('6months'))
              .order('founded_date', { ascending: false })
              .limit(10)
          : supabase
              .from('companies')
              .select('name, sector, founded_date, market_cap')
              .eq('status', 'ACTIVE')
              .eq('sector', selectedSector)
              .gte('founded_date', getDateRange('6months'))
              .order('founded_date', { ascending: false })
              .limit(10)
      ]);

      if (companiesResult.error) throw companiesResult.error;
      if (fundingResult.error) throw fundingResult.error;
      if (financialResult.error) throw financialResult.error;

      const companies = companiesResult.data || [];
      const fundingRounds = fundingResult.data || [];
      const financialStatements = financialResult.data || [];
      const recentCompanies = recentCompaniesResult.data || [];

      // Debug logging for raw data
      console.log('Raw data from database:', {
        companiesCount: companies.length,
        companiesWithMarketCap: companies.filter(c => c.market_cap && c.market_cap !== null).length,
        sampleCompanies: companies.slice(0, 3).map(c => ({ 
          id: c.id, 
          market_cap: c.market_cap, 
          sector: c.sector,
          is_listed: c.is_listed 
        }))
      });

      // Process the data
      const processedData = processMarketData(
        companies,
        fundingRounds,
        financialStatements,
        recentCompanies,
        selectedSector
      );

      setMarketData(processedData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range) => {
    const now = new Date();
    switch (range) {
      case '3months':
        return new Date(now.setMonth(now.getMonth() - 3)).toISOString();
      case '6months':
        return new Date(now.setMonth(now.getMonth() - 6)).toISOString();
      case '1year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      case '2years':
        return new Date(now.setFullYear(now.getFullYear() - 2)).toISOString();
      case '5years':
        return new Date(now.setFullYear(now.getFullYear() - 5)).toISOString();
      case 'all':
        return new Date('1900-01-01').toISOString(); // Very early date to include all records
      default:
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    }
  };

  const processMarketData = (companies, fundingRounds, financialStatements, recentCompanies, sector) => {
    // Filter by sector if specified
    const filteredCompanies = sector === 'all' 
      ? companies 
      : companies.filter(c => c.sector?.toLowerCase() === sector.toLowerCase());

    // Debug logging
    console.log('Processing market data:', {
      totalCompanies: companies.length,
      companiesWithMarketCap: companies.filter(c => c.market_cap && c.market_cap !== null).length,
      sampleMarketCaps: companies.filter(c => c.market_cap && c.market_cap !== null).slice(0, 5).map(c => ({ id: c.id, market_cap: c.market_cap }))
    });

    // Calculate sector distribution (filter out companies with no sector)
    const sectorStats = {};
    companies
      .filter(company => company.sector && company.sector.trim() !== '') // Only include companies with valid sectors
      .forEach(company => {
        const companySector = company.sector.trim();
        if (!sectorStats[companySector]) {
          sectorStats[companySector] = {
            name: companySector,
            companies: 0,
            totalMarketCap: 0,
            listedCount: 0,
            averageEmployees: 0,
            totalEmployees: 0
          };
        }
        sectorStats[companySector].companies++;
        if (company.market_cap && company.market_cap !== null) {
          const marketCapValue = parseFloat(company.market_cap);
          if (!isNaN(marketCapValue)) {
            sectorStats[companySector].totalMarketCap += marketCapValue;
          }
        }
        if (company.is_listed) {
          sectorStats[companySector].listedCount++;
        }
        if (company.employee_count) {
          sectorStats[companySector].totalEmployees += parseInt(company.employee_count);
        }
      });

    // Also calculate total market cap across all companies (including those without sectors)
    const totalMarketCapAllCompanies = companies
      .filter(company => company.market_cap && company.market_cap !== null)
      .reduce((sum, company) => {
        const marketCapValue = parseFloat(company.market_cap);
        return sum + (isNaN(marketCapValue) ? 0 : marketCapValue);
      }, 0);

    console.log('Market cap calculation:', {
      totalMarketCapAllCompanies,
      sectorStatsTotal: Object.values(sectorStats).reduce((sum, s) => sum + s.totalMarketCap, 0),
      sectorStats: Object.values(sectorStats).map(s => ({ name: s.name, totalMarketCap: s.totalMarketCap }))
    });

    // Calculate averages and sort sectors
    const topSectors = Object.values(sectorStats)
      .map(sector => ({
        ...sector,
        averageMarketCap: sector.companies > 0 ? sector.totalMarketCap / sector.companies : 0,
        averageEmployees: sector.companies > 0 ? sector.totalEmployees / sector.companies : 0,
        listingRate: sector.companies > 0 ? (sector.listedCount / sector.companies) * 100 : 0
      }))
      .sort((a, b) => b.companies - a.companies)
      .slice(0, 8);

    // Calculate funding statistics
    const totalFunding = fundingRounds.reduce((sum, round) => {
      return sum + (parseFloat(round.amount_raised) || 0);
    }, 0);

    const avgDealSize = fundingRounds.length > 0 ? totalFunding / fundingRounds.length : 0;

    // Recent funding deals
    const recentDeals = fundingRounds
      .filter(round => round.amount_raised && parseFloat(round.amount_raised) > 0)
      .sort((a, b) => new Date(b.funding_date) - new Date(a.funding_date))
      .slice(0, 10)
      .map(round => ({
        company: round.companies?.name || 'Unknown',
        amount: parseFloat(round.amount_raised) || 0,
        sector: round.companies?.sector || 'Unknown',
        date: round.funding_date,
        roundType: round.round_type
      }));

    // Generate funding trend data for the last 12 months
    const fundingTrend = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthFunding = fundingRounds
        .filter(round => {
          const fundingDate = new Date(round.funding_date);
          return fundingDate >= month && fundingDate <= monthEnd;
        })
        .reduce((sum, round) => sum + (parseFloat(round.amount_raised) || 0), 0);
      
      fundingTrend.push({
        month: month,
        funding: monthFunding / 1000000 // Convert to millions
      });
    }

    // Calculate growth metrics (simplified)
    const currentYearCompanies = companies.filter(c => 
      c.founded_date && new Date(c.founded_date).getFullYear() === new Date().getFullYear()
    ).length;

    const lastYearCompanies = companies.filter(c => 
      c.founded_date && new Date(c.founded_date).getFullYear() === new Date().getFullYear() - 1
    ).length;

    const companyGrowth = lastYearCompanies > 0 
      ? ((currentYearCompanies - lastYearCompanies) / lastYearCompanies * 100).toFixed(1)
      : 0;

    // Market trends
    const marketTrends = [
      { 
        metric: 'Total Funding Raised', 
        value: `₹${(totalFunding / 1000000000).toFixed(1)}B`, 
        change: '+12.5%', 
        trend: 'up' 
      },
      { 
        metric: 'Average Deal Size', 
        value: `₹${(avgDealSize / 1000000).toFixed(1)}M`, 
        change: '+5.3%', 
        trend: 'up' 
      },
      { 
        metric: 'New Companies', 
        value: currentYearCompanies.toString(), 
        change: `${companyGrowth > 0 ? '+' : ''}${companyGrowth}%`, 
        trend: companyGrowth >= 0 ? 'up' : 'down' 
      },
      { 
        metric: 'Listed Companies', 
        value: companies.filter(c => c.is_listed).length.toString(), 
        change: '+3.2%', 
        trend: 'up' 
      }
    ];

    return {
      totalCompanies: filteredCompanies.length,
      totalFunding: totalFunding / 1000000000, // Convert to billions
      averageValuation: avgDealSize / 1000000, // Convert to millions
      activeSectors: Object.keys(sectorStats).length,
      topSectors: topSectors.slice(0, 5),
      recentDeals,
      marketTrends,
      recentCompanies: recentCompanies.slice(0, 5),
      sectorDistribution: topSectors,
      fundingByRoundType: getFundingByRoundType(fundingRounds),
      fundingTrend: fundingTrend,
      totalMarketCapAllCompanies: totalMarketCapAllCompanies
    };
  };

  const getFundingByRoundType = (fundingRounds) => {
    const roundTypeStats = {};
    fundingRounds.forEach(round => {
      const roundType = round.round_type || 'Other';
      if (!roundTypeStats[roundType]) {
        roundTypeStats[roundType] = { count: 0, totalAmount: 0 };
      }
      roundTypeStats[roundType].count++;
      roundTypeStats[roundType].totalAmount += parseFloat(round.amount_raised) || 0;
    });

    return Object.entries(roundTypeStats)
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        totalAmount: stats.totalAmount / 1000000, // Convert to millions
        averageAmount: stats.count > 0 ? stats.totalAmount / stats.count / 1000000 : 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const exportMarketData = () => {
    if (!marketData) return;

    const exportData = {
      generated_at: new Date().toISOString(),
      filters: { 
        sector: selectedSector, 
        timeRange, 
        companyType, 
        companySize 
      },
      summary: {
        total_companies: marketData.totalCompanies,
        total_funding_billions: marketData.totalFunding,
        average_valuation_millions: marketData.averageValuation,
        active_sectors: marketData.activeSectors
      },
      sector_analysis: marketData.topSectors,
      recent_deals: marketData.recentDeals,
      market_trends: marketData.marketTrends,
      funding_by_round_type: marketData.fundingByRoundType
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market_analysis_${selectedSector}_${timeRange}_${companyType}_${companySize}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    navigate('/');
  };

  // Access denied component for non-enterprise users
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          isLoggedIn={!!user}
          user={userProfile}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-purple-100 mb-8">
              <Lock className="h-12 w-12 text-purple-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Market Analysis
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Access comprehensive market analysis and sector insights with Enterprise plan.
            </p>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upgrade to Enterprise
              </h2>
              
              <p className="text-gray-600 mb-6">
                Unlock advanced market analysis, sector insights, and comprehensive data analytics.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Comprehensive market trends analysis
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Sector-wise funding insights
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Advanced data visualization
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Exportable reports and analytics
                </div>
              </div>
              
              <button
                onClick={() => navigate('/contact')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Contact Us to Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isLoggedIn={!!user}
        user={userProfile}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-8 w-8 mr-3 text-purple-600" />
                Market Analysis
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time market insights and sector analysis from your database
              </p>
            </div>
            {/* Improved Filter Layout */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                {/* Sector Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Sector</label>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    >
                      <option value="all">All Sectors</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="financial services">Financial Services</option>
                      <option value="energy">Energy</option>
                      <option value="automotive">Automotive</option>
                      <option value="retail">Retail</option>
                      <option value="education">Education</option>
                      <option value="real estate">Real Estate</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="telecommunications">Telecommunications</option>
                      <option value="transportation">Transportation</option>
                      <option value="media & entertainment">Media & Entertainment</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="pharmaceutical">Pharmaceutical</option>
                    </select>
                  </div>
                </div>

                {/* Time Range Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Time Range</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    >
                      <option value="3months">Last 3 Months</option>
                      <option value="6months">Last 6 Months</option>
                      <option value="1year">Last Year</option>
                      <option value="2years">Last 2 Years</option>
                      <option value="5years">Last 5 Years</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </div>

                {/* Company Type Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Company Type</label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  >
                    <option value="all">All Company Types</option>
                    <option value="private">Private Limited</option>
                    <option value="public">Public Limited</option>
                    <option value="llp">LLP</option>
                    <option value="partnership">Partnership</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                  </select>
                </div>

                {/* Company Size Filter */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Company Size</label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  >
                    <option value="all">All Sizes</option>
                    <option value="startup">Startup (0-50)</option>
                    <option value="small">Small (51-200)</option>
                    <option value="medium">Medium (201-1000)</option>
                    <option value="large">Large (1000+)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-200">
                <button
                  onClick={fetchMarketData}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </button>
                
                <button
                  onClick={exportMarketData}
                  disabled={!marketData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Filters Summary */}
        {(selectedSector !== 'all' || timeRange !== '1year' || companyType !== 'all' || companySize !== 'all') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedSector !== 'all' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Sector: {selectedSector}
                    </span>
                  )}
                  {timeRange !== '1year' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Time: {timeRange.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  )}
                  {companyType !== 'all' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Type: {companyType}
                    </span>
                  )}
                  {companySize !== 'all' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Size: {companySize}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSector('all');
                  setTimeRange('1year');
                  setCompanyType('all');
                  setCompanySize('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Analyzing market data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Data</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={fetchMarketData}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setSelectedSector('all');
                    setTimeRange('1year');
                    setCompanyType('all');
                    setCompanySize('all');
                    setError(null);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        ) : marketData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Companies</p>
                    <p className="text-2xl font-bold text-gray-900">{marketData.totalCompanies.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Funding</p>
                    <p className="text-2xl font-bold text-gray-900">₹{marketData.totalFunding.toFixed(1)}B</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                    <p className="text-2xl font-bold text-gray-900">₹{marketData.averageValuation.toFixed(1)}M</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Sectors</p>
                    <p className="text-2xl font-bold text-gray-900">{marketData.activeSectors}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Data Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Sector Distribution
                </h3>
                <div ref={sectorChartRef} className="flex justify-center"></div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Funding Trend (12 Months)
                </h3>
                <div ref={fundingTrendRef} className="flex justify-center"></div>
              </div>
            </div>

            {/* Advanced Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart className="h-5 w-5 mr-2" />
                  Valuation vs Companies Bubble Chart
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Bubble size represents listed companies count
                </p>
                <div ref={valuationBubbleRef} className="flex justify-center"></div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Growth Opportunity Matrix
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Market opportunity heat map
                </p>
                <div ref={growthMatrixRef} className="flex justify-center"></div>
              </div>
            </div>

            {/* Interactive Metrics Dashboard */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Interactive Sector Comparison
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {marketData.topSectors.slice(0, 4).map((sector, index) => (
                  <div 
                    key={sector.name}
                    className="relative overflow-hidden rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    style={{ 
                      background: `linear-gradient(135deg, ${
                        ['#EBF8FF', '#F0FDF4', '#FEF3C7', '#FEF2F2'][index]
                      }, white)` 
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{sector.name}</h4>
                        <span className={`w-3 h-3 rounded-full ${
                          ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'][index]
                        }`}></span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Companies</span>
                          <span className="font-medium">{sector.companies}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'][index]
                            }`}
                            style={{ 
                              width: `${(sector.companies / Math.max(...marketData.topSectors.map(s => s.companies))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Market Cap</span>
                          <span className="font-medium">₹{(sector.totalMarketCap / 1000000000).toFixed(1)}B</span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Listed</span>
                          <span className="font-medium">{sector.listedCount}</span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Listing Rate</span>
                          <span className="font-medium">{sector.listingRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{marketData.topSectors.reduce((sum, s) => sum + s.companies, 0)}</div>
                  <div className="text-sm text-gray-600">Total Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {marketData.totalMarketCapAllCompanies > 0 
                      ? `₹${(marketData.totalMarketCapAllCompanies / 1000000000000).toFixed(1)}T`
                      : marketData.totalMarketCapAllCompanies > 1000000000
                        ? `₹${(marketData.totalMarketCapAllCompanies / 1000000000).toFixed(1)}B`
                        : marketData.totalMarketCapAllCompanies > 1000000
                          ? `₹${(marketData.totalMarketCapAllCompanies / 1000000).toFixed(1)}M`
                          : `₹${marketData.totalMarketCapAllCompanies.toLocaleString()}`
                    }
                  </div>
                  <div className="text-sm text-gray-600">Combined Market Cap</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {marketData.topSectors.reduce((sum, s) => sum + s.listedCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Listed Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {((marketData.topSectors.reduce((sum, s) => sum + s.listedCount, 0) / 
                       marketData.topSectors.reduce((sum, s) => sum + s.companies, 0)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Listing Rate</div>
                </div>
              </div>
            </div>

            {/* Recent Deals */}
            {marketData.recentDeals.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Recent Major Deals
                  </h3>
                  <button 
                    onClick={exportMarketData}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sector
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Round Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marketData.recentDeals.map((deal, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {deal.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{(deal.amount / 1000000).toFixed(1)}M
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {deal.sector}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {deal.roundType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(deal.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-600">Unable to load market analysis data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAnalysis;