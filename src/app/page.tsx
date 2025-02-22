// nextjs-bitcoin-guess/pages/index.js
"use client"

import { useState, useEffect, SetStateAction } from 'react'
import { FaClock } from 'react-icons/fa'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient | null {
  if (typeof window !== 'undefined' && !supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase URL or Anon Key')
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabase
}

export default function Home() {
  const [btcPrice, setBtcPrice] = useState<number | null>(null)
  const [guess, setGuess] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [remainingTime, setRemainingTime] = useState(60);

  useEffect(() => {
    const client = getSupabaseClient()

    if (!client) {
      setLoading(false)

      return
    }

    const playerIdFromStorage = localStorage.getItem('playerId')

    if (playerIdFromStorage) {
      setPlayerId(playerIdFromStorage)
      fetchScore(playerIdFromStorage)
    } else {
      createPlayer()
    }

    fetchBtcPrice()

    const interval = setInterval(fetchBtcPrice, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (guess && startTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));

        setRemainingTime(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          resolveGuess();
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRemainingTime(60);
    }
  }, [guess, startTime])

  async function createPlayer() {
    const client = getSupabaseClient()

    if (!client) return

    try {
      const { data, error } = await client
        .from('players')
        .insert([{ score: 0 }])
        .select()

      if (error) throw error

      const newPlayerId = data[0].id

      setPlayerId(newPlayerId)

      localStorage.setItem('playerId', newPlayerId)

      setScore(0)
      setLoading(false)
    } catch (err) {
      console.error('Error creating player:', err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }

      setLoading(false)
    }
  }

  async function fetchScore(playerId: string) {
    const client = getSupabaseClient()

    if (!client) return

    try {
      const { data, error } = await client
        .from('players')
        .select('score')
        .eq('id', playerId)

      if (error) throw error

      if (data && data.length > 0) {
        setScore(data[0].score)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error fetching score:', err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }

      setLoading(false)
    }
  }

  async function updateScore(newScore: SetStateAction<number>) {
    const client = getSupabaseClient()

    if (!client) return

    try {
      const { error } = await client
        .from('players')
        .update({ score: newScore, updated_at: new Date() })
        .eq('id', playerId)
      if (error) throw error

      setScore(newScore)
    } catch (err) {
      console.error('Error updating score:', err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    }
  }

  async function fetchBtcPrice() {
    try {
      const btcPriceApi = process.env.NEXT_PUBLIC_BTC_PRICE_API

      if (!btcPriceApi) {
        throw new Error('Missing BTC Price API URL')
      }

      const response = await fetch(btcPriceApi)

      const data = await response.json()

      setBtcPrice(data.bitcoin.usd)
    } catch (err) {
      console.error('Error fetching BTC price:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    }
  }

  async function handleGuess(choice: string) {
    if (guess) return

    setGuess(choice)
    setStartTime(Date.now())
  }

  async function resolveGuess() {
    try {
      const btcPriceApi = process.env.NEXT_PUBLIC_BTC_PRICE_API

      if (!btcPriceApi) {
        throw new Error('Missing BTC Price API URL')
      }

      const currentPrice = await fetch(btcPriceApi)
        .then(res => res.json())
        .then(data => data.bitcoin.usd)

      const initialPrice = btcPrice
      let newScore = score
      let notificationMessage = ""

      if (
        initialPrice !== null &&
        guess === 'up' &&
        currentPrice > initialPrice
      ) {
        newScore++
        notificationMessage = "Your guess was correct! Bitcoin went up."
      } else if (
        initialPrice !== null &&
        guess === 'down' &&
        currentPrice < initialPrice
      ) {
        newScore++
        notificationMessage = "Your guess was correct! Bitcoin went down."
      } else {
        newScore--
        notificationMessage = "Your guess was incorrect."
      }

      await updateScore(newScore)

      setGuess(null)
      setStartTime(null)
      fetchBtcPrice()

      if (typeof window !== 'undefined' && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Guess Result", { body: notificationMessage })
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("Guess Result", { body: notificationMessage })
            }
          })
        }
      }
    } catch (err) {
      console.error('Error resolving guess:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    }
  }

  if (loading)
    return <div className="flex justify-center items-center h-screen">
      Loading...
    </div>

  if (error)
    return <div className="flex justify-center items-center h-screen text-red-500">
      Error: {error}
    </div>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Bitcoin Price Guess</h1>
      <p className="text-lg mb-2">
        Current BTC Price: <span className="font-semibold">
          ${btcPrice ? btcPrice.toFixed(2) : 'Loading...'}
        </span>
      </p>
      <p className="text-lg mb-4">
        Your Score: <span className="font-semibold">
           {score}
        </span>
      </p>
      {!guess && (
        <div className="flex space-x-4">
          <button
            onClick={() => handleGuess('up')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Up
          </button>
          <button
            onClick={() => handleGuess('down')}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Down
          </button>
        </div>
      )}
      {guess && (
        <p className="text-lg mt-4 flex items-center">
          Your guess: <span className="font-semibold">{guess}</span>.
          Result in: <FaClock className="inline mr-2 ml-2" /> {remainingTime} seconds.
        </p>
      )}
    </div>
  )
}