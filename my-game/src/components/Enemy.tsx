import React from "react";

interface EnemyProps{
    x: number;
    y: number;
    width: number;
    height: number;
}


const Enemy: React.FC<EnemyProps> = ({ x, y, width, height }) => {
    return null; 
};

export default Enemy;