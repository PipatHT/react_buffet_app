import { useState } from 'react'
import buffetLogo from './assets/Logo.png'
import { buffetConfig } from './buffetConfig'
import './App.css'

const initialForm = {
  adults: '',
  children: '',
  drinkType: 'refill',
  water: '',
  soda: '',
  discount: String(buffetConfig.discounts[0]),
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [total, setTotal] = useState(0)
  const [hasCalculated, setHasCalculated] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      const nextErrors = { ...current, [field]: '' }
      if (field === 'adults' || field === 'children') {
        nextErrors.adults = ''
        nextErrors.children = ''
      }
      return nextErrors
    })
    setHasCalculated(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    const countFields = ['adults', 'children']
    const hasGuestCount = countFields.some((field) => form[field] !== '')

    if (!hasGuestCount) {
      nextErrors.adults = 'กรุณาระบุจำนวนผู้ใหญ่หรือเด็กอย่างน้อย 1 ช่อง'
      nextErrors.children = 'กรุณาระบุจำนวนผู้ใหญ่หรือเด็กอย่างน้อย 1 ช่อง'
    }

    countFields.forEach((field) => {
      const value = form[field]
      if (value !== '' && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
        nextErrors[field] = 'กรุณากรอกจำนวนเต็มตั้งแต่ 0 ขึ้นไป'
      }
    })

    if (form.drinkType === 'bottle') {
      ;['water', 'soda'].forEach((field) => {
        const value = form[field]
        if (value !== '' && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
          nextErrors[field] = 'กรุณากรอกจำนวนเต็มตั้งแต่ 0 ขึ้นไป'
        }
      })
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setHasCalculated(false)
      return
    }

    const adults = Number(form.adults || 0)
    const children = Number(form.children || 0)
    const foodTotal = adults * buffetConfig.adultPrice + children * buffetConfig.childPrice
    const discount = Number(form.discount)
    const discountedFoodTotal = foodTotal * (1 - discount / 100)
    const drinkTotal =
      form.drinkType === 'refill'
        ? (adults + children) * buffetConfig.refillPrice
        : Number(form.water || 0) * buffetConfig.waterPrice +
          Number(form.soda || 0) * buffetConfig.sodaPrice

    setTotal(discountedFoodTotal + drinkTotal)
    setHasCalculated(true)
  }

  const handleReset = () => {
    setForm(initialForm)
    setErrors({})
    setTotal(0)
    setHasCalculated(false)
  }

  const fieldError = (field) =>
    errors[field] && (
      <span className="field-error" id={`${field}-error`}>
        {errors[field]}
      </span>
    )

  return (
    <main className="page">
      <section className="calculator" aria-labelledby="page-title">
        <header className="page-header">
          <h1 id="page-title">Buffet Calculator</h1>
          <p>คำนวณค่าอาหารบุฟเฟต์</p>
          <img className="buffet-logo" src={buffetLogo} alt="อิ่มสุข หมูกระทะ" />
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="adults">จำนวนผู้ใหญ่ (คนละ {buffetConfig.adultPrice} บาท)</label>
            <input
              id="adults"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={form.adults}
              onChange={(event) => updateField('adults', event.target.value)}
              aria-invalid={Boolean(errors.adults)}
              aria-describedby={errors.adults ? 'adults-error' : undefined}
            />
            {fieldError('adults')}
          </div>

          <div className="form-field">
            <label htmlFor="children">จำนวนเด็ก (คนละ {buffetConfig.childPrice} บาท)</label>
            <input
              id="children"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={form.children}
              onChange={(event) => updateField('children', event.target.value)}
              aria-invalid={Boolean(errors.children)}
              aria-describedby={errors.children ? 'children-error' : undefined}
            />
            {fieldError('children')}
          </div>

          <fieldset className="drink-options">
            <legend>เครื่องดื่ม</legend>
            <label className="radio-option">
              <input
                type="radio"
                name="drinkType"
                value="refill"
                checked={form.drinkType === 'refill'}
                onChange={(event) => updateField('drinkType', event.target.value)}
              />
              <span>น้ำรีฟิล คนละ {buffetConfig.refillPrice} บาท (ผู้ใหญ่และเด็ก)</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="drinkType"
                value="bottle"
                checked={form.drinkType === 'bottle'}
                onChange={(event) => updateField('drinkType', event.target.value)}
              />
              <span>เครื่องดื่มแบบขวด</span>
            </label>

            <div className="form-field drink-quantity">
              <label htmlFor="water">น้ำเปล่า (ขวดละ {buffetConfig.waterPrice} บาท)</label>
              <input
                id="water"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.water}
                onChange={(event) => updateField('water', event.target.value)}
                disabled={form.drinkType === 'refill'}
                aria-invalid={Boolean(errors.water)}
                aria-describedby={errors.water ? 'water-error' : undefined}
              />
              {fieldError('water')}
            </div>

            <div className="form-field drink-quantity">
              <label htmlFor="soda">น้ำอัดลม (ขวดละ {buffetConfig.sodaPrice} บาท)</label>
              <input
                id="soda"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.soda}
                onChange={(event) => updateField('soda', event.target.value)}
                disabled={form.drinkType === 'refill'}
                aria-invalid={Boolean(errors.soda)}
                aria-describedby={errors.soda ? 'soda-error' : undefined}
              />
              {fieldError('soda')}
            </div>
          </fieldset>

          <div className="form-field discount-field">
            <label htmlFor="discount">บัตรส่วนลด</label>
            <select
              id="discount"
              value={form.discount}
              onChange={(event) => updateField('discount', event.target.value)}
            >
              {buffetConfig.discounts.map((discount) => (
                <option key={discount} value={discount}>
                  {discount === 0 ? 'ไม่มีส่วนลด' : `ส่วนลด ${discount}%`}
                </option>
              ))}
            </select>
            <small>ลดเฉพาะค่าอาหารทั้งหมด ไม่รวมเครื่องดื่ม</small>
          </div>

          <div className="actions">
            <button className="calculate-button" type="submit">
              คำนวณ
            </button>
            <button className="reset-button" type="button" onClick={handleReset}>
              รีเซ็ต
            </button>
          </div>
        </form>

        <output className="total" aria-live="polite">
          ยอดชำระทั้งหมด:{' '}
          <strong>
            {hasCalculated
              ? total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '0.00'}
          </strong>{' '}
          บาท
        </output>
      </section>
    </main>
  )
}

export default App
