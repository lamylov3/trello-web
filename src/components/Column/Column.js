import { React, useState, useEffect, useRef } from 'react';
// import { Container, Draggable } from "react-smooth-dnd";
import parse from 'html-react-parser';
import { MODAL_ACTION_CLOSE, MODAL_ACTION_CONFIRM } from 'utilities/constants';
import './Column.scss'
import Card from 'components/Card/Card';
import ConfirmModal from 'components/Common/ConfirmModal';
import { Container, Draggable } from 'react-smooth-dnd';
import { Dropdown, Form, InputGroup, FormControl, Button } from 'react-bootstrap'
import { cloneDeep } from 'lodash';
import { createCard, updateColumn } from 'actions/Api/index';

function Column(props) {
  const { column, onCardDrop, onUpdateColumn } = props;
  const cards = column.cards;
  const [ showConfirmModal, setShowConfirmModal ] = useState(false);
  const [ columnTitle, setColumnTitle ] = useState('');
  const [ showAddCardForm, setShowAddCardForm ] = useState(false);
  const [ newCardTitle, setNewCardTitle ] = useState('');
  //sort card
  if (cards && column.cardOrder) {
    cards.sort(function(a, b) {
      return column.cardOrder.indexOf(a._id) - column.cardOrder.indexOf(b._id);
    });
  }
  
  const newCardInputRef = useRef(null);

  useEffect(() => {
    if (showAddCardForm) {
      newCardInputRef.current.focus();
    }
  }, [showAddCardForm])

  useEffect(() => {
    setColumnTitle(column.title);
  }, [column.title])

  // todo Dung useEffect ntn thi no se bi callback nhieu lan
  // useEffect(() => {
  //   const newColumn = {
  //     ...column,
  //     _title: columnTitle
  //   }
  //   onUpdateColumn(newColumn);
  // }, [columnTitle])
  const handleOnBlur = () => {
    const cardsOfColumn = column.cards; 
    const newColumn = {
      ...column,
      title: columnTitle
    }
    if (column.title !== columnTitle) {
      // call api
      updateColumn(newColumn._id, newColumn).then((updatedColumn) => {
        let dataColumn = {
          ...updatedColumn.result,
          cards: cardsOfColumn
        }
        onUpdateColumn(dataColumn);
      });
    }
  }
  const onAction = (action) => {
    if (action == MODAL_ACTION_CLOSE) {
      setShowConfirmModal(false);
    }
    if (action == MODAL_ACTION_CONFIRM) {
      const newColumn = {
        ...column,
        __destroy: true
      }
      updateColumn(newColumn._id, newColumn).then((updatedColumn) => {
        onUpdateColumn(updatedColumn.result);
      });
    }
    toggleShowConfirmModal();
  }
  const toggleShowConfirmModal = () => {
    setShowConfirmModal(!showConfirmModal);
  }

  const selectAllInlineText = (e) => {
    e.target.focus();
    e.target.select();
  }

  const handleShowAddCardForm = () => {
    setShowAddCardForm(!showAddCardForm);
    if (showAddCardForm == false) {
      setNewCardTitle('');
    }
  }

  const addNewCard = () => {
    if (!newCardTitle) {
      newCardInputRef.current.focus();
      return
    }
    const newCardToAdd = {
      boardId: column.boardId,
      columnId: column._id,
      title: newCardTitle.trim(),
    }
    
    createCard(newCardToAdd).then((newCard) => {
      let newColumn = cloneDeep(column);
      newColumn.cards.push(newCard.result);
      newColumn.cardOrder.push(newCard.result._id);
      onUpdateColumn(newColumn);
      handleShowAddCardForm();
    });
   
  }
  return (
    <div className="column">
      <header className="column-drag-handle">
        <div className="column-title">
          <Form.Control aria-label="Small"
            type="text"
            className="trello-web-input-title"
            value={columnTitle}
            onClick={selectAllInlineText}
            onChange={(e) => {setColumnTitle(e.target.value)}}
            onBlur={handleOnBlur}
            onKeyDown={
              (e) => {
                if (e.key === 'Enter') {
                  setColumnTitle(e.target.value);
                  e.target.blur();
                }
              }
            }
          />
        </div>
        <div className="column-drop-down">
          <Dropdown>
            <Dropdown.Toggle id="dropdown-basic" size="sm" className="drop-down btn">
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={handleShowAddCardForm}>Add card</Dropdown.Item>
              <Dropdown.Item onClick={toggleShowConfirmModal}>Remove column</Dropdown.Item>
              <Dropdown.Item>Remove all card</Dropdown.Item>
              <Dropdown.Item>Something else</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
      <div className="card-list">
        <Container
          {...column.props}
          groupName="column"
          onDrop={dropResult => onCardDrop(column._id, dropResult)}
          getChildPayload={index => cards[index]}
          dragClass="card-ghost"
          dropClass="card-ghost-drop"
          dragHandleSelector=".card-item"
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: 'drop-preview'
          }}
          dropPlaceholderAnimationDuration={200}
        >
          {cards 
          ? cards.map((card, index) =>
            (
              <Draggable key={index}>
                <Card card={card} />
              </Draggable>
            )
          )
          : null
          }
        </Container>
        {showAddCardForm &&
        <div className="add-new-card">
          <InputGroup size="sm">
            <FormControl aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              placeholder="enter title edit card"
              className="input-new-column"
              ref={newCardInputRef}
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={
                (e) => {
                  if (e.key === 'Enter') {
                    addNewCard();
                  }
                }
              }
            />
          </InputGroup>
        </div>
        }
      </div>
      <footer className="footer">
        { !showAddCardForm &&
          <div className="footer-action" onClick={handleShowAddCardForm}>
            <i className="fa fa-plus icon" ></i>Add another card
          </div>
        }
        {showAddCardForm &&
          <div className="btn-add-card">
            <Button
              variant="success"
              className="button-add-card" size="sm"
              onClick={addNewCard}
            >
              Add card
            </Button>
            <div className="cancel-add-card"
              onClick={handleShowAddCardForm}
            >
              <i className="fa fa-times" ></i>
            </div>
          </div>
        }
      </footer>
      <ConfirmModal
        show={showConfirmModal}
        content={parse('<b>Bạn có chắc chắn muốn xóa</b>')}
        title="Xác nhận xóa"
        onAction={onAction}
      />
    </div>
  );
}

export default Column;