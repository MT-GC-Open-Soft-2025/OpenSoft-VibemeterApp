import React from 'react';
import EmotionZoneChart from "./EmotionZone";
import PieChart from "../components/PieChart";

const adminOverview = () => {
  return (
    <>
      <div className="wrapper fadeInDown">"This is admin page."</div>
      <div className="charts">
        <PieChart />
        <EmotionZoneChart />
      </div>
    </>
  )
}

export default adminOverview
