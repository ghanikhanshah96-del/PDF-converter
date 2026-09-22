# Design reference

Source: https://www.ilovepdf.com/
Page: iLovePDF \| Online PDF tools for PDF lovers

Measured from 197 rendered elements at 1920 x 911px. This is a sample of the current document and state, not the original design source.

## Color palette

Only observed CSS colors are listed. Usage labels describe where a color was found. Hex is an sRGB preview; retain the original CSS value for its color space and transparency.

Usage | Original CSS value | sRGB hex | Observed root properties | Occurrences
--- | --- | --- | --- | ---
Text | rgb(71, 71, 79) |  |  | 52
Text | rgb(229, 50, 45) |  |  | 40
Text | rgb(51, 51, 59) |  |  | 39
Text | rgb(112, 112, 120) |  |  | 32
Text | rgb(255, 255, 255) |  |  | 25
Text | rgb(22, 22, 22) |  |  | 9
Surface | rgb(255, 255, 255) |  |  | 2
Surface | rgb(245, 245, 250) |  |  | 1
Surface | rgb(229, 50, 45) |  |  | 1
Surface | rgb(255, 194, 51) |  |  | 1

## Typography

Role | Family | Size | Weight | Line height | Tracking | Text transform
--- | --- | --- | --- | --- | --- | ---
Heading | Graphik, Arial, sans-serif | 42px | 600 | 52px | normal | none
Section heading | Graphik, Arial, sans-serif | 22px | 400 | 32px | normal | none
Subheading | Graphik, Arial, sans-serif | 20px | 500 | 28px | normal | none
Body | Graphik, Arial, sans-serif | 16px | 400 | 28px | normal | none
Small text | Graphik, Arial, sans-serif | 13px | 400 | 18px | 0.3px | none

## Spacing

Value | Occurrences
--- | ---
2px | 3
4px | 1
6px | 4
8px | 62
12px | 24
16px | 19
20px | 7
24px | 5
32px | 141
48px | 4
357.5px | 2
417.5px | 2

## Layout gaps

Value | Occurrences
--- | ---
8px | 6

## Corner radii

Value | Occurrences
--- | ---
8px | 12
24px | 18

## Shadows

Value | Occurrences
--- | ---
rgba(22, 22, 22, 0.1) 0px 5px 30px 0px | 3

## Motion durations

Value | Occurrences
--- | ---
0.2s | 6
0.3s | 6
0.1s | 3

## Motion easing

Value | Occurrences
--- | ---
ease-in-out | 12
linear | 3

### Accessible keyframe names

- fade-in-right-left
- fade-in-bottom
- pulse
- shake
- fade-in
- fadeIn
- slideIn
- slideOutLeft
- slideOutRight
- backgroundAnimate
- stroke
- scale

## Component recipes

Computed styles for the captured state. Selectors identify sampled elements; text and placeholders come from the page. Form values are excluded. These style specimens do not reconstruct child markup or uncaptured interaction states.

### Button 1

```css
button {
  align-items: center;
  background-color: rgb(229, 50, 45);
  background-image: none;
  border-radius: 8px;
  border-top-color: rgb(255, 255, 255);
  border-top-style: none;
  border-top-width: 0px;
  box-shadow: none;
  color: rgb(255, 255, 255);
  display: flex;
  font-family: Graphik, Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  gap: 8px;
  justify-content: center;
  letter-spacing: normal;
  line-height: 18px;
  padding-bottom: 8px;
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 8px;
  text-transform: none;
}
```

### Button 2

```css
button {
  align-items: center;
  background-color: rgb(255, 194, 51);
  background-image: none;
  border-radius: 8px;
  border-top-color: rgb(51, 51, 59);
  border-top-style: none;
  border-top-width: 0px;
  box-shadow: none;
  color: rgb(51, 51, 59);
  display: inline-flex;
  font-family: Graphik, Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  gap: 8px;
  justify-content: center;
  letter-spacing: normal;
  line-height: 26px;
  padding-bottom: 8px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 8px;
  text-transform: none;
}
```

### Button 3

```css
button {
  align-items: center;
  background-color: rgb(255, 255, 255);
  background-image: none;
  border-radius: 8px;
  border-top-color: rgb(229, 50, 45);
  border-top-style: none;
  border-top-width: 0px;
  box-shadow: none;
  color: rgb(229, 50, 45);
  display: inline-flex;
  font-family: Graphik, Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  gap: 8px;
  justify-content: center;
  letter-spacing: normal;
  line-height: 26px;
  padding-bottom: 8px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 8px;
  text-transform: none;
}
```

### Card 1

```css
card {
  align-items: normal;
  background-color: rgba(0, 0, 0, 0);
  background-image: none;
  border-radius: 24px;
  border-top-color: rgb(71, 71, 79);
  border-top-style: none;
  border-top-width: 0px;
  box-shadow: rgba(22, 22, 22, 0.1) 0px 5px 30px 0px;
  color: rgb(71, 71, 79);
  display: flex;
  font-family: Graphik, Arial, sans-serif;
  font-size: 16px;
  font-weight: 500;
  gap: normal;
  justify-content: normal;
  letter-spacing: normal;
  line-height: 20px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 0px;
  text-transform: none;
}
```

### Card 2

```css
card {
  align-items: normal;
  background-color: rgba(0, 0, 0, 0);
  background-image: none;
  border-radius: 24px 24px 0px 0px;
  border-top-color: rgb(71, 71, 79);
  border-top-style: none;
  border-top-width: 0px;
  box-shadow: none;
  color: rgb(71, 71, 79);
  display: inline;
  font-family: Graphik, Arial, sans-serif;
  font-size: 16px;
  font-weight: 500;
  gap: normal;
  justify-content: normal;
  letter-spacing: normal;
  line-height: 20px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 0px;
  text-transform: none;
}
```

### Card 3

```css
card {
  align-items: normal;
  background-color: rgba(0, 0, 0, 0);
  background-image: none;
  border-radius: 0px;
  border-top-color: rgb(71, 71, 79);
  border-top-style: none;
  border-top-width: 0px;
  box-shadow: none;
  color: rgb(71, 71, 79);
  display: flex;
  font-family: Graphik, Arial, sans-serif;
  font-size: 16px;
  font-weight: 500;
  gap: normal;
  justify-content: normal;
  letter-spacing: normal;
  line-height: 20px;
  padding-bottom: 48px;
  padding-left: 32px;
  padding-right: 32px;
  padding-top: 32px;
  text-transform: none;
}
```

## Layout measurements

Element | Width | Display | Columns | Gap | Padding (T R B L)
--- | --- | --- | --- | --- | ---
header | 1905px | block | none | normal | 0px 24px 0px 24px

## Responsive conditions

- `(max-width: 240px)`
- `(min-width: 241px) and (max-width: 480px)`
- `(min-width: 481px) and (max-width: 768px)`
- `(min-width: 360px)`
- `(min-width: 768px)`
- `(min-width: 992px)`
- `(min-width: 1366px)`
- `(min-width: 1140px)`
- `(min-width: 1440px)`
- `print`
- `(max-width: 991.98px)`
- `(max-width: 767.98px)`
- `(max-width: 1365.98px)`
- `(max-width: 480px)`
- `(max-width: 860px)`
- `(min-width: 860px) and (max-width: 1120px)`
- `(min-width: 1360px)`
- `(min-width: 860px)`
- `(max-width: 1520px)`
- `(min-width: 1900px)`

## Capture coverage

- 0 stylesheet(s) could not be inspected. Computed styles are still measured.
- Sampling excludes hidden elements and Sitepeel tools. Offscreen rendered elements may be included. Counts refer to the sample, not the entire website.
- Colors are CSS values, not a screenshot pixel palette. Images, compositing and gradients can affect their visible appearance.
- Hover, focus, active states, other viewport sizes, iframe documents and shadow trees need separate captures.
- No inferred brand personality, invented colors, placeholder copy or unobserved code is presented as a page measurement.
