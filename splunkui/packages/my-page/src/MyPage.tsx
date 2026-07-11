import React, { useState } from 'react';

import Button from '@splunk/react-ui/Button';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Text from '@splunk/react-ui/Text';
import Layout from '@splunk/react-ui/Layout';
import TrashCanCross from '@splunk/react-icons/TrashCanCross';
import { StyledContainer, StyledGreeting } from './MyPageStyles';


type ListInputArgs = {
    items: string[];
    setItems: React.Dispatch<React.SetStateAction<string[]>>;
}

function ListInput({ items, setItems }: ListInputArgs) {
    const [text, setText] = useState('');
    const handleButtonClick = () => {
        // to handle duplicate values, would need to introduce a unique ID such as UUID as key
        if (!items.includes(text)) {
            setItems((prev) => [...prev, text]);
        }
        setText('');
    };
    const handleRemoveItem = (item: string) => {
        setItems((prev) => prev.filter((i) => i !== item));
    };
    return (<div>
        <div>
            {items.map((item) =>
                <div key={item}>
                    <Layout style={{ justifyContent: 'flex-end' }}>
                        <span>{item}</span>
                        <Button icon={<TrashCanCross />} appearance="destructive"
                                onClick={() => handleRemoveItem(item)} />
                    </Layout>
                </div>
            )}
        </div>
        <ControlGroup label="Add Item">
            <Text canClear value={text} onChange={(e, { value }) => setText(value)} />
            <Button label="Add" onClick={handleButtonClick} disabled={text.length === 0} />
        </ControlGroup>
    </div>);
}

const MyPage = () => {
    const [items, setItems] = useState<string[]>([
        'Hello', 'World', 'aaa'
    ]);
    return (
        <StyledContainer>
            <StyledGreeting data-testid="greeting">
                Hello, from inside MyPage!
            </StyledGreeting>
            <ListInput items={items} setItems={setItems} />
        </StyledContainer>
    );
};

export default MyPage;
