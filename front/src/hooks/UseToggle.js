import { useState } from 'react';

export default function UseToggle() {
  const [toggle, setToggle] = useState(false);

  const onToggle = () => {
    const next = !toggle;
    setToggle(next);
  };
  return [toggle, onToggle];
}
