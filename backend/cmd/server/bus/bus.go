package bus

import (
	"log"
	"sync"
	"time"
)

type Event struct {
	ID        string
	Name      string
	Data      any
	Timestamp time.Time
}

type IEventBus interface {
	Publish(event Event)
	Subscribe(eventName string, consumerID string, handler func(Event) error)
}

type inMemoryEventBus struct {
	subscribers map[string][]subscriber
	mu          sync.RWMutex
}

type subscriber struct {
	ID     string
	Handle func(Event) error
}

func NewInMemoryEventBus() IEventBus {
	return &inMemoryEventBus{
		subscribers: make(map[string][]subscriber),
	}
}

func (b *inMemoryEventBus) Publish(e Event) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	if subs, ok := b.subscribers[e.Name]; ok {
		log.Printf("Publishing event: %s to %d subscribers", e.Name, len(subs))
		for _, s := range subs {
			go func(s subscriber) {
				if err := s.Handle(e); err != nil {
					log.Printf(
						"Error while handling event %s in subscriber %s: %v",
						e.ID,
						s.ID,
						err,
					)
					// TODO: retry, dead letter queue etc.
				}
			}(s)
		}
	} else {
		log.Printf("No subscribers found for published event: %s", e.Name)
	}
}

func (b *inMemoryEventBus) Subscribe(eventName string, consumerID string, fn func(Event) error) {
	b.mu.Lock()
	defer b.mu.Unlock()

	subscriber := subscriber{
		ID:     consumerID,
		Handle: fn,
	}

	b.subscribers[eventName] = append(b.subscribers[eventName], subscriber)
}
