
import React from 'react';

interface MonetizationCardProps {
  title: string;
  description: string;
  image: string;
  icon?: React.ReactNode;
}

const MonetizationCard: React.FC<MonetizationCardProps> = ({
  title,
  description,
  image,
  icon,
}) => {
  return (
    <div className="mb-8">
      <div className="relative rounded-lg overflow-hidden mb-4">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-40 object-cover"
        />
        {icon && (
          <div className="absolute bottom-3 right-3">
            {icon}
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default MonetizationCard;
